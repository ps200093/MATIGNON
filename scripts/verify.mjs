import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import jsQR from "jsqr";

mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHANNEL
    ? { channel: process.env.PLAYWRIGHT_CHANNEL }
    : {},
);
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
const report = [];
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("heading", { name: "You're Invited" }).waitFor();
  await page.locator(".cover-art").evaluate((image) => image.decode());
  await page.screenshot({ path: "artifacts/01-cover.png" });
  let a11y = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    a11y.violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => n.target),
    })),
    [],
  );
  await page
    .getByRole("button", { name: "초대장 열기", exact: true })
    .first()
    .click();
  await page.getByRole("heading", { name: "Jazz after dark." }).waitFor();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: "artifacts/02-hero.png" });
  for (let y = 500; y < 3300; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(900);
  await page.screenshot({
    path: "artifacts/03-invitation.png",
    fullPage: true,
  });
  a11y = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    a11y.violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => n.target),
    })),
    [],
  );
  await page.getByRole("button", { name: "RSVP", exact: true }).click();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
      true,
    );
  }
  await page.keyboard.press("Escape");
  await page.locator("dialog").waitFor({ state: "detached" });
  assert.equal(
    await page
      .getByRole("button", { name: "RSVP", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.getByRole("button", { name: "RSVP", exact: true }).click();
  await page.getByRole("button", { name: /다음에 만나요/ }).click();
  assert.equal(
    await page.getByRole("button", { name: "참석 인원 늘리기" }).count(),
    0,
  );
  await page.getByRole("button", { name: /함께할게요/ }).click();
  await page.getByRole("button", { name: "미리보기 응답 보내기" }).click();
  assert.equal(
    await page.locator("#name").getAttribute("aria-invalid"),
    "true",
  );
  assert.equal(
    await page.locator("#name").evaluate((el) => el === document.activeElement),
    true,
  );
  await page.locator("#name").fill("테스트 게스트");
  assert.equal(
    await page.locator("#name").getAttribute("aria-invalid"),
    "false",
  );
  await page.getByRole("button", { name: "참석 인원 늘리기" }).click();
  await page.locator("#consent").check();
  await page.screenshot({ path: "artifacts/04-rsvp.png" });
  a11y = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    a11y.violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => n.target),
    })),
    [],
  );
  await page.route("**/api/rsvp", (route) => route.abort());
  await page.getByRole("button", { name: "미리보기 응답 보내기" }).click();
  await page.getByRole("alert").filter({ hasText: "연결을 확인" }).waitFor();
  assert.equal(await page.locator("#name").inputValue(), "테스트 게스트");
  await page.unroute("**/api/rsvp");
  await page.getByRole("button", { name: "미리보기 응답 보내기" }).click();
  await page.getByText("미리보기 응답이 완료되었습니다.").waitFor();
  await page.screenshot({ path: "artifacts/05-receipt.png" });
  await page.getByRole("button", { name: "초대장으로 돌아가기" }).click();
  await page
    .getByRole("button", { name: "초대장 공유", exact: true })
    .first()
    .click();
  const qr = page.getByRole("img", { name: "초대장 접속 QR 코드" });
  await qr.waitFor();
  await page.waitForTimeout(400);
  const data = await qr.getAttribute("src");
  const png = PNG.sync.read(Buffer.from(data.split(",")[1], "base64"));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.equal(decoded.data, `${base}/`);
  await page.screenshot({ path: "artifacts/06-qr.png" });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").count(), 0);
  report.push(
    "390px: cover, invitation, validation, failure recovery, RSVP success, QR decode, dialog Escape; axe zero violations",
  );
  for (const width of [320, 480]) {
    await page.setViewportSize({ width, height: 740 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    await page.getByRole("button", { name: "응답 확인", exact: true }).click();
    assert.equal(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
      true,
    );
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: `artifacts/07-mobile-${width}.png` });
  }
  report.push(
    "320px and 480px: no horizontal overflow, accessible response sheet",
  );
  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await reduced.goto(base);
  await reduced
    .getByRole("button", { name: "초대장 열기", exact: true })
    .first()
    .click();
  await reduced.getByRole("heading", { name: "Jazz after dark." }).waitFor();
  assert.equal(
    await reduced
      .locator(".hero-beam")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  report.push("Reduced motion: immediate open, no ambient animation");
  assert.deepEqual(errors, []);
  writeFileSync(
    "artifacts/verification.json",
    JSON.stringify({ passed: true, checks: report }, null, 2),
  );
  console.log(report.join("\n"));
} finally {
  await browser.close();
}
