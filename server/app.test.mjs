import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createApp } from "./app.mjs";

async function boot(env, fn) {
  const server = createApp(env);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((r) => server.close(r));
  }
}
const payload = {
  name: "테스트 손님",
  attendance: "yes",
  guests: 2,
  consent: true,
  requestKey: "test-idempotency-key-1234",
};
const post = (base, value, headers = {}) =>
  fetch(`${base}/api/rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(value),
  });

test("preview accepts valid response but never creates storage", async () => {
  const dir = mkdtempSync(join(tmpdir(), "matignon-preview-"));
  try {
    await boot({ DATA_DIR: dir }, async (base) => {
      const event = await (await fetch(`${base}/api/event`)).json();
      assert.equal(event.mode, "preview");
      assert.equal(event.start, null);
      const response = await post(base, payload);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).mode, "preview");
      assert.equal(existsSync(join(dir, "rsvp.sqlite")), false);
    });
  } finally {
    rmSync(dir, { recursive: true });
  }
});
test("validation, origin, private routes and wrong content type are rejected", async () => {
  await boot({}, async (base) => {
    for (const body of [
      null,
      {},
      { ...payload, name: "a" },
      { ...payload, consent: false },
      { ...payload, guests: 8 },
      { ...payload, attendance: "no", guests: 2 },
    ])
      assert.equal((await post(base, body)).status, 400);
    assert.equal(
      (await post(base, payload, { Origin: "https://untrusted.example" }))
        .status,
      403,
    );
    assert.equal(
      (await post(base, payload, { "Content-Type": "text/plain" })).status,
      415,
    );
    assert.equal((await fetch(`${base}/api/responses`)).status, 404);
    assert.equal(
      (await post(base, { ...payload, name: "a".repeat(5000) })).status,
      413,
    );
  });
});
test("live mode persists exactly once, rejects conflicting retry, survives restart", async () => {
  const dir = mkdtempSync(join(tmpdir(), "matignon-live-"));
  const env = {
    RSVP_MODE: "live",
    EVENT_START: "2026-12-01T19:00:00+09:00",
    EVENT_END: "2026-12-01T23:00:00+09:00",
    EVENT_ADDRESS: "테스트 전용 장소",
    PUBLIC_URL: "https://invitation.example",
    PRIVACY_NOTICE: "Test notice only",
    DATA_DIR: dir,
  };
  let id;
  try {
    await boot(env, async (base) => {
      const first = await post(base, payload);
      assert.equal(first.status, 201);
      id = (await first.json()).id;
      const second = await post(base, payload);
      assert.equal(second.status, 200);
      assert.equal((await second.json()).id, id);
      assert.equal(
        (await post(base, { ...payload, name: "다른 손님" })).status,
        409,
      );
    });
    await boot(env, async (base) => {
      const result = await post(base, payload);
      assert.equal((await result.json()).id, id);
    });
    const db = new DatabaseSync(join(dir, "rsvp.sqlite"), { readOnly: true });
    assert.equal(
      db.prepare("SELECT count(*) AS total FROM responses").get().total,
      1,
    );
    db.close();
  } finally {
    rmSync(dir, { recursive: true });
  }
});
test("live mode refuses incomplete event setup", () => {
  assert.throws(() => createApp({ RSVP_MODE: "live" }), /requires valid/);
});

test("Vercel refuses live mode backed by ephemeral SQLite", () => {
  assert.throws(
    () => createApp({ RSVP_MODE: "live", VERCEL: "1" }),
    /requires durable storage/,
  );
});
