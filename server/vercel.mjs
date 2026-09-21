import { createRequestHandler } from "./app.mjs";

let handler;

export default async function vercelHandler(req, res) {
  try {
    handler ||= createRequestHandler(process.env);
    await handler(req, res);
  } catch (error) {
    console.error("Invitation API failed:", error.message);
    if (!res.headersSent) {
      res.writeHead(503, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify({ error: "초대장 서비스 설정을 확인해주세요." }));
    } else if (!res.writableEnded) res.end();
  }
}
