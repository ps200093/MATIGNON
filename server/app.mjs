import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

export function createApp(env = process.env) {
  const live = env.RSVP_MODE === "live";
  if (
    live &&
    (!env.EVENT_START ||
      !env.EVENT_END ||
      !env.EVENT_ADDRESS ||
      !env.PRIVACY_NOTICE ||
      !env.PUBLIC_URL?.startsWith("https://") ||
      !Number.isFinite(Date.parse(env.EVENT_START)) ||
      Date.parse(env.EVENT_END) <= Date.parse(env.EVENT_START))
  )
    throw new Error(
      "Live mode requires valid event dates, address, HTTPS PUBLIC_URL and PRIVACY_NOTICE.",
    );
  let db;
  if (live) {
    mkdirSync(env.DATA_DIR || "./data", { recursive: true });
    db = new DatabaseSync(resolve(env.DATA_DIR || "./data", "rsvp.sqlite"));
    db.exec(
      "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, request_key TEXT UNIQUE, name TEXT NOT NULL, attendance TEXT NOT NULL, guests INTEGER NOT NULL, created_at TEXT NOT NULL)",
    );
  }
  const event = {
    mode: live ? "live" : "preview",
    title: env.EVENT_TITLE || "The Private Night",
    venue: env.EVENT_VENUE || "MATIGNON SEOUL",
    address: env.EVENT_ADDRESS || null,
    start: env.EVENT_START || null,
    end: env.EVENT_END || null,
    publicUrl: env.PUBLIC_URL || null,
    privacyNotice: env.PRIVACY_NOTICE || null,
  };
  const buckets = new Map();
  const server = createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    const json = (code, value) => {
      res.writeHead(code, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(value));
    };
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/api/event" && req.method === "GET")
      return json(200, event);
    if (pathname === "/api/rsvp" && req.method === "POST") {
      const origin = req.headers.origin;
      if (
        origin &&
        origin !== `http://${req.headers.host}` &&
        origin !== `https://${req.headers.host}` &&
        origin !== event.publicUrl?.replace(/\/$/, "")
      )
        return json(403, { error: "허용되지 않은 요청입니다." });
      if (!req.headers["content-type"]?.startsWith("application/json"))
        return json(415, { error: "JSON 요청이 필요합니다." });
      const now = Date.now();
      for (const [key, value] of buckets)
        if (now - value.time > 60000) buckets.delete(key);
      const ip = req.socket.remoteAddress;
      const bucket = buckets.get(ip) || { time: now, count: 0 };
      if (++bucket.count > 30)
        return json(429, { error: "잠시 후 다시 시도해주세요." });
      buckets.set(ip, bucket);
      let raw = "";
      try {
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 4096) {
            json(413, { error: "요청이 너무 큽니다." });
            return;
          }
        }
      } catch {
        return;
      }
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        return json(400, { error: "요청 형식을 확인해주세요." });
      }
      if (
        !body ||
        typeof body !== "object" ||
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 40 ||
        !["yes", "no"].includes(body.attendance) ||
        !Number.isInteger(body.guests) ||
        body.guests < 1 ||
        body.guests > 4 ||
        (body.attendance === "no" && body.guests !== 1) ||
        body.consent !== true ||
        typeof body.requestKey !== "string" ||
        !/^[\w-]{16,80}$/.test(body.requestKey)
      )
        return json(400, {
          error: "이름, 참석 여부와 필수 동의를 확인해주세요.",
        });
      if (!live)
        return json(200, {
          id: `PREVIEW-${body.requestKey.slice(0, 8).toUpperCase()}`,
          mode: "preview",
        });
      try {
        const existing = db
          .prepare(
            "SELECT id, name, attendance, guests FROM responses WHERE request_key = ?",
          )
          .get(body.requestKey);
        if (existing) {
          if (
            existing.name !== body.name.trim() ||
            existing.attendance !== body.attendance ||
            existing.guests !== body.guests
          )
            return json(409, {
              error: "이전 응답 처리 상태를 확인한 후 새로 시도해주세요.",
            });
          return json(200, { id: existing.id, mode: "live" });
        }
        const id = randomUUID();
        db.prepare("INSERT INTO responses VALUES (?, ?, ?, ?, ?, ?)").run(
          id,
          body.requestKey,
          body.name.trim(),
          body.attendance,
          body.guests,
          new Date().toISOString(),
        );
        return json(201, { id, mode: "live" });
      } catch {
        return json(503, {
          error:
            "저장하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도해주세요.",
        });
      }
    }
    if (pathname.startsWith("/api/"))
      return json(404, { error: "요청한 기능을 찾을 수 없습니다." });
    if (!["GET", "HEAD"].includes(req.method))
      return json(405, { error: "지원하지 않는 요청입니다." });
    const root = resolve("dist");
    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      return json(400, { error: "잘못된 주소입니다." });
    }
    const target = resolve(root, "." + decoded);
    if (!target.startsWith(root + sep) && target !== root)
      return json(403, { error: "허용되지 않은 경로입니다." });
    const file = target === root ? resolve(root, "index.html") : target;
    if (!existsSync(file))
      return json(404, { error: "페이지를 찾을 수 없습니다." });
    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".woff2": "font/woff2",
    };
    try {
      const data = readFileSync(file);
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control":
          extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      json(404, { error: "페이지를 찾을 수 없습니다." });
    }
  });
  server.on("close", () => db?.close());
  return server;
}
