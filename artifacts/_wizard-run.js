const fs = require("fs");
const { chromium } = require("playwright-core");

(async () => {
  const browser = await chromium.launch({ headless: false, executablePath: process.env.CHROME });
  const page = await browser.newPage();
  const logs = [];

  page.on("console", (msg) => logs.push("[console:" + msg.type() + "] " + msg.text()));
  page.on("pageerror", (err) => logs.push("[pageerror] " + (err && err.message ? err.message : String(err))));
  page.on("requestfailed", (req) => logs.push("[requestfailed] " + req.url() + " " + (req.failure()?.errorText || "")));

  const keywords = [
    "openhaard","kookeiland","bar","krukken","opberg","bank","eettafel","raam","buiten","tv","game","bijkeuken","koelkast","wasmachine","droger","lichte vloer","glad","trap","voordeur","gang","slaapkamer","balkon","badkamer","inloop","kast","3 slaapkamers","4 slaapkamers"
  ];

  const perChapter = {};

  try {
    await page.goto("http://localhost:3000/wizard?test=true", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    await page.getByRole("heading", { name: "De Basis." }).waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: /Verbouwing/i }).click();
    await page.getByPlaceholder("Bijv. Uitbouw Serre").fill("Verbouw 3632JH 3");
    await page.getByPlaceholder("Postcode + Huisnr.").fill("3632JH 3");
    await page.getByPlaceholder("€ 0").fill("600000");

    const chatInput = page.locator('input[placeholder*="Stel je vraag"]:visible').first();
    if (await chatInput.count()) {
      await chatInput.fill(process.env.WIZ_TEXT || "");
      const sendBtn = page.getByRole("button", { name: /Verstuur bericht|Send/i }).first();
      if (await sendBtn.count()) {
        await sendBtn.click();
      }
    } else {
      logs.push("[flow-error] No visible chat input found.");
    }

    await page.waitForTimeout(8000);

    const chapters = ["Wensen","Ruimtes","Budget","Techniek","Duurzaam","Duurzaamheid","Risico","Basis"];
    for (const ch of chapters) {
      const re = new RegExp(ch, "i");
      const btn = page.getByRole("button", { name: re }).first();
      const link = page.getByRole("link", { name: re }).first();
      if (await btn.count()) {
        await btn.click();
      } else if (await link.count()) {
        await link.click();
      } else {
        continue;
      }
      await page.waitForTimeout(1500);

      const snapshot = await page.evaluate((keywords) => {
        const text = document.body?.innerText || "";
        const inputs = Array.from(document.querySelectorAll("input, textarea")).map((el) => (el.value || "").trim());
        const combined = (text + "\n" + inputs.join("\n")).toLowerCase();
        const hits = Object.fromEntries(keywords.map((k) => [k, combined.includes(k.toLowerCase())]));
        return { hits };
      }, keywords);

      perChapter[ch] = snapshot.hits;
      await page.screenshot({ path: `artifacts\\wizard-${ch.toLowerCase()}.png`, fullPage: true });
    }

    await page.screenshot({ path: "artifacts\\wizard-after-pve.png", fullPage: true });
  } catch (err) {
    logs.push("[flow-error] " + (err && err.message ? err.message : String(err)));
    await page.screenshot({ path: "artifacts\\wizard-error-or-state.png", fullPage: true });
  } finally {
    fs.writeFileSync("artifacts\\wizard-console.log", logs.join("\n"));
    fs.writeFileSync("artifacts\\wizard-pve-check.json", JSON.stringify({ perChapter }, null, 2));
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
