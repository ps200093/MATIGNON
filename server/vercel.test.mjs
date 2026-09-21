import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

test("Vercel entrypoints serve event JSON and accept parsed RSVP bodies", async () => {
  const event = (await import("../api/event.js")).default;
  const rsvp = (await import("../api/rsvp.js")).default;
  const server = createServer(async (req, res) => {
    if (req.method === "POST") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      req.body = JSON.parse(raw);
    }
    await (req.url === "/api/event" ? event : rsvp)(req, res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(`${base}/api/event`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/json/);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).mode, "preview");
    const submit = (origin = base) =>
      fetch(`${base}/api/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify({
          name: "배포 테스트",
          attendance: "yes",
          guests: 1,
          consent: true,
          requestKey: "vercel-test-request-1234",
        }),
      });
    const saved = await submit();
    assert.equal(saved.status, 200);
    assert.equal((await saved.json()).mode, "preview");
    assert.equal((await submit("https://untrusted.example")).status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
