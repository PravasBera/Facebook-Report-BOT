const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });

let jobRunning = false;
let jobAbort = false;
let clients = [];

// SSE
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

function sendLog(msg) {
  for (const c of clients) {
    c.write(`data: ${msg}\n\n`);
  }
}

// Load cookies
async function loadCookies(page, file) {
  const cookies = JSON.parse(fs.readFileSync(file, "utf-8"));
  for (let c of cookies) await page.setCookie(c);
}

// Save cookies
async function saveCookies(page, file) {
  const cookies = await page.cookies();
  fs.writeFileSync(file, JSON.stringify(cookies, null, 2));
}

// Report flow (demo selectors)
async function reportFlow(page, url, reason) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    await page.click('text="Report post"');
    await page.waitForTimeout(1000);

    await page.click(`text="${reason}"`);
    await page.waitForTimeout(1000);

    await page.click('text="Submit"');
    await page.waitForTimeout(2000);

    return true;
  } catch (e) {
    return false;
  }
}

// Start job
app.post("/start", upload.array("cookies"), async (req, res) => {
  if (jobRunning) return res.json({ ok: false, msg: "Already running" });
  jobRunning = true;
  jobAbort = false;

  const { targetUrl, reason, type } = req.body;
  const cookieFiles = req.files.map(f => f.path);

  res.json({ ok: true, msg: "Job started" });

  sendLog(`🚀 Starting job with ${cookieFiles.length} accounts...`);

  for (const file of cookieFiles) {
    if (jobAbort) break;

    sendLog(`➡️ Using ${file}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await loadCookies(page, file);
      const ok = await reportFlow(page, targetUrl, reason);
      if (ok) sendLog(`✔ Report submitted from ${file}`);
      else sendLog(`❌ Report failed from ${file}`);
      await saveCookies(page, file);
    } catch (e) {
      sendLog(`❌ Error: ${e.message}`);
    }

    await browser.close();
    await new Promise(r => setTimeout(r, 3000));
  }

  sendLog("🎯 Job finished!");
  jobRunning = false;
});

// Stop job
app.post("/stop", (req, res) => {
  jobAbort = true;
  sendLog("⏹ Stop requested...");
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
