// server.js
// Minimal, robust Express server + Puppeteer runner for cookie-based FB reporting
// Usage:
//   - Put flows in flows.js
//   - uploads/cookies.txt : each line = one raw cookie string (like "fr=...; xs=...; c_user=...; ...")
//   - Start server, use UI or API to start/stop

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const { EventEmitter } = require('events');
const { spawn } = require('child_process');

const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = path.resolve(__dirname);
const UPLOAD_DIR = path.join(ROOT, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const PUBLIC_DIR = path.join(ROOT, 'public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// flows file (you provided)
const FLOWS_PATH = path.join(ROOT, 'flows.js');
let flows = {};
try { flows = require(FLOWS_PATH); } catch (e) {
  console.warn('⚠ flows.js not found or invalid. Put your flow definitions in flows.js');
  flows = { profileSets: [], pageSets: [], postSets: [] };
}

// middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

// multer for file uploads (cookies)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

/* ------------------------
   Simple SSE logging per session
   ------------------------ */
const sessions = new Map(); // sessionId -> { clients:Set(res), running:boolean, abort:boolean, emitter:EventEmitter }

function getSession(sid) {
  if (!sid) sid = 'default';
  if (!sessions.has(sid)) {
    sessions.set(sid, { clients: new Set(), running: false, abort: false, emitter: new EventEmitter(), logs: [] });
  }
  return sessions.get(sid);
}

function sseSend(sid, event, payload) {
  const sess = getSession(sid);
  const data = { ts: Date.now(), event, payload };
  // store limited logs
  sess.logs.push(`${new Date().toLocaleTimeString()} ${event} ${JSON.stringify(payload)}`);
  if (sess.logs.length > 1000) sess.logs.shift();

  for (const res of sess.clients) {
    try {
      if (event && event !== 'message') {
        res.write(`event: ${event}\n`);
      }
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      sess.clients.delete(res);
    }
  }
}

/* ------------------------
   Cookie parser utility
   - Accepts raw cookie line like:
     fr=...; xs=...; c_user=1000...;
   - Returns array of cookie objects suitable for page.setCookie(...)
   ------------------------ */
function parseRawCookieLine(line) {
  if (!line || !line.trim()) return null;
  const parts = line.split(';').map(p => p.trim()).filter(Boolean);
  const cookies = [];
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const name = p.slice(0, idx).trim();
    const value = p.slice(idx + 1).trim();
    cookies.push({
      name,
      value,
      domain: '.facebook.com',
      path: '/',
      httpOnly: false,
      secure: true
    });
  }
  // require minimal cookie keys
  const hasCUser = cookies.some(c => c.name === 'c_user');
  const hasXs = cookies.some(c => c.name === 'xs');
  if (!hasCUser || !hasXs) return null;
  return cookies;
}

/* ------------------------
   Read cookies.txt (one account per line) OR single-file per account
   - If uploads/cookies.txt exists, read lines.
   - Also allow multiple cookie files in uploads/ dir (optional).
   ------------------------ */
function loadCookieAccounts() {
  const out = [];
  const cookieTxt = path.join(UPLOAD_DIR, 'cookies.txt');
  if (fs.existsSync(cookieTxt)) {
    const lines = fs.readFileSync(cookieTxt, 'utf-8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const l of lines) {
      const parsed = parseRawCookieLine(l);
      if (parsed) out.push(parsed);
    }
  } else {
    // try each file in uploads/ that ends with .txt and not tokens/comments
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.endsWith('.txt'));
    for (const f of files) {
      if (f === 'cookies.txt') continue;
      // treat file content as cookie line
      const content = fs.readFileSync(path.join(UPLOAD_DIR, f), 'utf-8').trim();
      if (!content) continue;
      const parsed = parseRawCookieLine(content);
      if (parsed) out.push(parsed);
    }
  }
  return out;
}

/* ------------------------
   Simple, robust Puppeteer runner:
   - Iterates over accounts
   - For each account: set cookies, goto target, run flow (sequence of selectors)
   - Handles timeouts, retries, logs, graceful abort
   ------------------------ */

async function runFlowOnPage(page, flowSteps, opts = {}) {
  // flowSteps: array of { label, selector } selectors are either:
  //  - "xpath:...."  OR
  //  - "css:...."   OR
  //  - plain CSS or plain XPATH (we'll try both)
  const { sessionId, perActionDelay = 1000, actionTimeout = 12000 } = opts;

  for (const step of flowSteps) {
    if (getSession(sessionId).abort) throw new Error('ABORTED');
    const label = step.label || step.selector || 'step';
    const rawSel = (step.selector || '').trim();
    sseSend(sessionId, 'log', { msg: `Step: ${label}`, sel: rawSel });

    let success = false;
    let lastErr = null;

    // try strategy: css if starts with css:, xpath if starts with xpath:, else try both
    const tries = [];
    if (/^css:/.test(rawSel)) tries.push({ type: 'css', sel: rawSel.replace(/^css:/, '') });
    else if (/^xpath:/.test(rawSel)) tries.push({ type: 'xpath', sel: rawSel.replace(/^xpath:/, '') });
    else {
      // try css then xpath
      tries.push({ type: 'css', sel: rawSel });
      tries.push({ type: 'xpath', sel: rawSel });
    }

    for (const t of tries) {
      try {
        if (t.type === 'css') {
          await page.waitForSelector(t.sel, { timeout: Math.max(3000, Math.min(actionTimeout, 8000)) });
          // clickable?
          const el = await page.$(t.sel);
          if (!el) throw new Error('No element found (css)');
          await el.click({ delay: 100 });
          success = true;
        } else {
          // xpath
          await page.waitForXPath(t.sel, { timeout: Math.max(3000, Math.min(actionTimeout, 8000)) });
          const els = await page.$x(t.sel);
          if (!els || !els.length) throw new Error('No element found (xpath)');
          await els[0].click({ delay: 100 });
          success = true;
        }
      } catch (err) {
        lastErr = err;
        // continue to next try
      }
      if (success) break;
    }

    if (!success) {
      // Try tolerant click: search by text fallback
      try {
        const text = step.text || null;
        if (text) {
          // basic xpath text search
          const x = `//*[contains(normalize-space(string(.)),'${text}')]`;
          await page.waitForXPath(x, { timeout: Math.min(actionTimeout, 4000) });
          const els = await page.$x(x);
          if (els && els.length) { await els[0].click({ delay: 80 }); success = true; }
        }
      } catch(e) { lastErr = e; }
    }

    if (!success) {
      sseSend(sessionId, 'warn', { step: label, error: (lastErr && lastErr.message) || 'selector not found' });
      // depending on step.failBehavior, we can continue or stop. Default: continue
      if (step.mandatory) {
        throw new Error(`Mandatory step failed: ${label}`);
      } else {
        // continue to next step
      }
    } else {
      sseSend(sessionId, 'log', { step: label, ok: true });
    }

    // small wait after each click to allow modal to load
    await new Promise(res => setTimeout(res, perActionDelay + Math.floor(Math.random()*400)));
  } // end for steps
}

/* ------------------------
   reportRunner(sessionId, options)
   - options.targetUrl
   - options.setType: 'profile'|'page'|'post'
   - options.setId: which set id, e.g., 'ProfileSet1'
   - options.concurrent: not used; we run sequentially per account
   - options.headless: true/false
   ------------------------ */
async function reportRunner(sessionId, opts = {}) {
  const sess = getSession(sessionId);
  try {
    sess.running = true;
    sess.abort = false;

    const cookieAccounts = loadCookieAccounts();
    if (!cookieAccounts.length) {
      sseSend(sessionId, 'error', { msg: 'No cookie accounts found (uploads/cookies.txt or .txt files)' });
      sess.running = false;
      return;
    }

    const target = String(opts.targetUrl || '').trim();
    if (!target) {
      sseSend(sessionId, 'error', { msg: 'No targetUrl provided' });
      sess.running = false;
      return;
    }

    // pick set steps from flows
    const kind = (opts.setType || 'profile').toLowerCase();
    const which = opts.setId || null;
    let sets = [];
    if (kind === 'profile') sets = flows.profileSets || [];
    else if (kind === 'page') sets = flows.pageSets || [];
    else sets = flows.postSets || [];
    if (!sets.length) {
      sseSend(sessionId, 'error', { msg: 'No flow sets found for ' + kind });
      sess.running = false;
      return;
    }
    const found = which ? sets.find(s => s.id === which || s.name === which) : sets[0];
    if (!found) {
      sseSend(sessionId, 'error', { msg: 'Requested set not found: ' + which });
      sess.running = false;
      return;
    }

    // Puppeteer browser
    const browser = await puppeteer.launch({
      headless: !!opts.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      defaultViewport: { width: 390, height: 844 } // mobile-like
    });

    // iterate accounts sequentially
    let accountIndex = 0;
    for (const cookies of cookieAccounts) {
      if (getSession(sessionId).abort) break;
      accountIndex++;
      const accId = cookies.find(c => c.name === 'c_user')?.value || `acct_${accountIndex}`;
      sseSend(sessionId, 'info', { msg: `Starting account ${accountIndex}`, account: accId });

      let page;
      try {
        page = await browser.newPage();

        // set mobile UA just in case
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36');

        // set cookies
        // some cookies like 'wd' depend on viewport; keep path/domain set above
        await page.setCookie(...cookies);

        // navigate to target
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500 + Math.floor(Math.random()*1500));

        // run the flow steps
        await runFlowOnPage(page, found.steps, { sessionId, perActionDelay: opts.perActionDelay || 1200, actionTimeout: opts.actionTimeout || 12000 });

        sseSend(sessionId, 'success', { account: accId, msg: 'Flow completed' });

        // save cookies back (optional) - update cookies file? We skip overwriting by default
        await page.waitForTimeout(800);
        await page.close();
      } catch (err) {
        sseSend(sessionId, 'error', { account: accId, error: (err && err.message) || String(err) });
        try { if (page && !page.isClosed()) await page.close(); } catch(e){}
      }

      // small gap between accounts to reduce detection
      await new Promise(res => setTimeout(res, (opts.gapMs || 2500) + Math.floor(Math.random()*2000)));
    } // end accounts loop

    await browser.close();
    sseSend(sessionId, 'done', { msg: 'Runner finished' });
  } catch (e) {
    sseSend(sessionId, 'fatal', { msg: e.message || String(e) });
  } finally {
    const s = getSession(sessionId);
    s.running = false;
    s.abort = false;
  }
}

/* ------------------------
   Routes
   ------------------------ */

// SSE events endpoint
app.get('/events', (req, res) => {
  const sid = req.query.sessionId || 'default';
  const sess = getSession(sid);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  // send a hello
  res.write(`event: ready\n`);
  res.write(`data: ${JSON.stringify({ msg: 'SSE connected', sessionId: sid })}\n\n`);

  sess.clients.add(res);

  req.on('close', () => {
    sess.clients.delete(res);
  });
});

// upload cookies file
app.post('/uploadCookies', upload.single('cookies'), (req, res) => {
  // Accept single file named 'cookies' (text). Also accept raw text in body.text
  try {
    if (req.file) {
      // saved to uploads/<filename>
      return res.json({ ok: true, path: req.file.path });
    } else if (req.body && req.body.text) {
      const txt = String(req.body.text || '').trim();
      if (!txt) return res.status(400).json({ ok:false, message:'Empty text' });
      fs.writeFileSync(path.join(UPLOAD_DIR, 'cookies.txt'), txt, 'utf-8');
      return res.json({ ok:true, path: 'uploads/cookies.txt' });
    } else {
      return res.status(400).json({ ok:false, message:'No file or text' });
    }
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
});

// start job
app.post('/start', async (req, res) => {
  const body = req.body || {};
  const sessionId = body.sessionId || 'default';
  const targetUrl = body.targetUrl;
  const setType = body.setType || 'profile'; // profile|page|post
  const setId = body.setId || null;
  const headless = body.headless === true || body.headless === 'true';
  const gapMs = parseInt(body.gapMs || 2500);

  const sess = getSession(sessionId);
  if (sess.running) return res.status(409).json({ ok:false, message:'Job already running' });

  // quick validation
  if (!targetUrl) return res.status(400).json({ ok:false, message:'targetUrl required' });

  // spawn runner asynchronously (not awaiting)
  (async () => {
    try {
      await reportRunner(sessionId, { targetUrl, setType, setId, headless, gapMs, perActionDelay: parseInt(body.perActionDelay||1200) });
    } catch(e) {
      sseSend(sessionId, 'fatal', { msg: e.message || String(e) });
    }
  })();

  res.json({ ok:true, message:'Job started', sessionId });
});

// stop job
app.post('/stop', (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (!sess.running) return res.json({ ok:false, message:'No active job' });
  sess.abort = true;
  sseSend(sessionId, 'info', { msg:'Stop requested by user' });
  return res.json({ ok:true, message:'Stop requested' });
});

// status / logs
app.get('/status', (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  res.json({
    running: sess.running,
    abort: sess.abort,
    logs: sess.logs.slice(-200)
  });
});

// download example cookies.txt
app.get('/exampleCookies', (req,res) => {
  res.type('text/plain').send('fr=...; xs=...; c_user=1000...; datr=...; sb=...; wd=390x844;');
});

/* ------------------------
   Global error handlers + process guards
   ------------------------ */
app.use((err, req, res, next) => {
  console.error('Uncaught server error:', err);
  try { res.status(500).json({ ok:false, message: err.message || 'Server error' }); } catch(e){}
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

/* ------------------------
   Start server
   ------------------------ */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
