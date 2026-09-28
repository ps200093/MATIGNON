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
  await page.getByRole("heading", { name: "Live Social Club" }).waitFor();
  assert.equal(await page.getByText("AI 콘셉트 이미지").count(), 0);
  assert.equal(
    await page
      .getByText("주차 : 매장 바로 옆 발렛 부스 이용 가능", { exact: true })
      .count(),
    1,
  );
  assert.equal(
    await page.getByText("Soft Opening 가오픈", { exact: true }).count(),
    1,
  );
  assert.equal(
    await page.getByText("Grand Opening 정식 오픈", { exact: true }).count(),
    1,
  );
  assert.equal(
    await page.getByRole("heading", { name: "A cocktail, on us." }).count(),
    0,
  );
  assert.equal(
    await page.getByRole("button", { name: "RSVP", exact: true }).count(),
    0,
  );
  await page.getByRole("timer", { name: "행사 시작까지 남은 시간" }).waitFor();
  assert.equal(await page.getByText("DAYS", { exact: true }).count(), 1);
  assert.equal(await page.getByText("HRS", { exact: true }).count(), 1);
  assert.equal(await page.getByText("MINS", { exact: true }).count(), 1);
  assert.equal(await page.getByText("SECS", { exact: true }).count(), 1);
  assert.equal(
    await page
      .locator(".countdown-flap-top")
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
    "split-flap-top",
  );
  const secondsDigit = await page
    .locator(".countdown-segment")
    .nth(3)
    .locator(".countdown-flap")
    .last()
    .innerText();
  await page.waitForFunction((previousDigit) => {
    const flaps = document.querySelectorAll(
      ".countdown-segment:nth-child(4) .countdown-flap",
    );
    return flaps[flaps.length - 1]?.textContent !== previousDigit;
  }, secondsDigit);
  assert.match(
    await page
      .getByRole("timer", { name: "행사 시작까지 남은 시간" })
      .innerText(),
    /(?:\d+일\s+\d{2}:\d{2}:\d{2}|행사가 시작되었습니다\.)/,
  );
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
    "390px: cover, invitation, countdown, QR decode, dialog Escape; axe zero violations",
  );
  for (const width of [320, 480]) {
    await page.setViewportSize({ width, height: 740 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: `artifacts/07-mobile-${width}.png` });
  }
  report.push("320px and 480px: no horizontal overflow");
  const cabaret = await context.newPage();
  await cabaret.goto(`${base}/?v=moulin-rouge`);
  await cabaret
    .getByRole("button", { name: "커튼 열기", exact: true })
    .waitFor();
  await cabaret.getByRole("button", { name: "커튼 열기", exact: true }).click();
  await cabaret.locator(".moulin-stage").waitFor({ state: "detached" });
  await cabaret.getByRole("heading", { name: /Live.*Social Club/ }).waitFor();
  assert.equal(
    await cabaret
      .locator(".moulin h1")
      .evaluate((element) => getComputedStyle(element).animationName),
    "moulin-sign-on",
  );
  assert.equal(
    await cabaret
      .getByText("주차 : 매장 바로 옆 발렛 부스 이용 가능", { exact: true })
      .count(),
    1,
  );
  assert.equal(
    await cabaret.getByText("Soft Opening 가오픈", { exact: true }).count(),
    1,
  );
  assert.equal(
    await cabaret.getByText("Grand Opening 정식 오픈", { exact: true }).count(),
    1,
  );
  await cabaret
    .getByRole("timer", { name: "행사 시작까지 남은 시간" })
    .waitFor();
  assert.equal(
    await cabaret.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await cabaret.screenshot({
    path: "artifacts/08-moulin-rouge.png",
    fullPage: true,
  });
  await cabaret.close();
  report.push(
    "Moulin Rouge variant: event details and countdown render at 390px",
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
  await reduced.getByRole("heading", { name: "Live Social Club" }).waitFor();
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
