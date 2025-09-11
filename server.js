// server.js
// Robust Express + Puppeteer automation server
// Handles flows, cookies, multi-account runs, logging, abort, crash guards

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const { EventEmitter } = require('events');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = path.resolve(__dirname);
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LOG_DIR = path.join(ROOT, 'logs');

for (const d of [UPLOAD_DIR, PUBLIC_DIR, LOG_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

// === Flows ===
const FLOWS_PATH = path.join(ROOT, 'flows.js');
let flows = {};
try {
  flows = require(FLOWS_PATH);
} catch (e) {
  console.warn('⚠ flows.js not found or invalid. Put your flow definitions in flows.js');
  flows = { profileSets: [], pageSets: [], postSets: [] };
}

// === Middlewares ===
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

// === File uploads ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// === Sessions (for SSE logs & jobs) ===
const sessions = new Map();
function getSession(sid) {
  if (!sid) sid = 'default';
  if (!sessions.has(sid)) {
    sessions.set(sid, {
      clients: new Set(),
      running: false,
      abort: false,
      emitter: new EventEmitter(),
      logs: [],
      browser: null,
      pages: []
    });
  }
  return sessions.get(sid);
}

// === Logging helpers ===
function simpleLog(...args) {
  const line =
    `[${new Date().toISOString()}] ` +
    args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') +
    '\n';
  fs.appendFileSync(path.join(LOG_DIR, 'server.log'), line);
}

function sseSend(sid, event, payload) {
  const sess = getSession(sid);
  const data = { ts: Date.now(), event, payload };
  sess.logs.push(`${new Date().toLocaleTimeString()} ${event} ${JSON.stringify(payload)}`);
  if (sess.logs.length > 1000) sess.logs.shift();
  simpleLog(event, payload);

  for (const res of sess.clients) {
    try {
      if (event && event !== 'message') res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      sess.clients.delete(res);
    }
  }
}

// === Cookie parsing ===
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
  const hasCUser = cookies.some(c => c.name === 'c_user');
  const hasXs = cookies.some(c => c.name === 'xs');
  if (!hasCUser || !hasXs) return null;
  return cookies;
}

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
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.endsWith('.txt'));
    for (const f of files) {
      if (f === 'cookies.txt') continue;
      const content = fs.readFileSync(path.join(UPLOAD_DIR, f), 'utf-8').trim();
      if (!content) continue;
      const parsed = parseRawCookieLine(content);
      if (parsed) out.push(parsed);
    }
  }
  return out;
}

// === Utility ===
function isValidUrl(u) {
  try {
    const p = new URL(u);
    return ['http:', 'https:'].includes(p.protocol);
  } catch {
    return false;
  }
}

// === Run flow ===
async function runFlowOnPage(page, flowSteps, opts = {}) {
  const { sessionId, perActionDelay = 1000, actionTimeout = 12000 } = opts;

  for (const step of flowSteps) {
    if (getSession(sessionId).abort) throw new Error('ABORTED');
    const label = step.label || step.selector || 'step';
    const rawSel = (step.selector || '').trim();
    sseSend(sessionId, 'log', { msg: `Step: ${label}`, sel: rawSel });

    let success = false;
    let lastErr = null;
    const tries = [];

    if (/^css:/.test(rawSel)) tries.push({ type: 'css', sel: rawSel.replace(/^css:/, '') });
    else if (/^xpath:/.test(rawSel)) tries.push({ type: 'xpath', sel: rawSel.replace(/^xpath:/, '') });
    else {
      tries.push({ type: 'css', sel: rawSel });
      tries.push({ type: 'xpath', sel: rawSel });
    }

    for (const t of tries) {
      try {
        if (t.type === 'css') {
          await page.waitForSelector(t.sel, { timeout: Math.min(actionTimeout, 8000) });
          const el = await page.$(t.sel);
          if (!el) throw new Error('No element found (css)');
          await el.click({ delay: 100 });
          success = true;
        } else {
          await page.waitForXPath(t.sel, { timeout: Math.min(actionTimeout, 8000) });
          const els = await page.$x(t.sel);
          if (!els || !els.length) throw new Error('No element found (xpath)');
          await els[0].click({ delay: 100 });
          success = true;
        }
      } catch (err) {
        lastErr = err;
      }
      if (success) break;
    }

    if (!success) {
      sseSend(sessionId, 'warn', { step: label, error: (lastErr && lastErr.message) || 'selector not found' });
      if (step.mandatory) throw new Error(`Mandatory step failed: ${label}`);
    } else {
      sseSend(sessionId, 'log', { step: label, ok: true });
    }

    await new Promise(res => setTimeout(res, perActionDelay + Math.floor(Math.random() * 400)));
  }
}

// === Runner ===
async function reportRunner(sessionId, opts = {}) {
  const sess = getSession(sessionId);
  try {
    sess.running = true;
    sess.abort = false;

    const cookieAccounts = loadCookieAccounts();
    const MAX_ACCOUNTS = parseInt(process.env.MAX_ACCOUNTS || '200', 10);
    if (cookieAccounts.length > MAX_ACCOUNTS) cookieAccounts.length = MAX_ACCOUNTS;
    if (!cookieAccounts.length) {
      sseSend(sessionId, 'error', { msg: 'No cookie accounts found' });
      sess.running = false;
      return;
    }

    const target = String(opts.targetUrl || '').trim();
    if (!target || !isValidUrl(target)) {
      sseSend(sessionId, 'error', { msg: 'Invalid targetUrl' });
      sess.running = false;
      return;
    }

    const kind = (opts.setType || 'profile').toLowerCase();
    const sets = kind === 'profile' ? flows.profileSets || [] : kind === 'page' ? flows.pageSets || [] : flows.postSets || [];
    const found = opts.setId ? sets.find(s => s.id === opts.setId || s.name === opts.setId) : sets[0];
    if (!found) {
      sseSend(sessionId, 'error', { msg: 'Flow set not found' });
      sess.running = false;
      return;
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: !!opts.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: { width: 390, height: 844 }
      });
      sess.browser = browser;
    } catch (e) {
      sseSend(sessionId, 'fatal', { msg: 'Browser launch failed: ' + e.message });
      sess.running = false;
      return;
    }

    let accountIndex = 0;
    for (const cookies of cookieAccounts) {
      if (sess.abort) break;
      accountIndex++;
      const accId = cookies.find(c => c.name === 'c_user')?.value || `acct_${accountIndex}`;
      sseSend(sessionId, 'info', { msg: `Account ${accountIndex}`, account: accId });

      let page;
      try {
        page = await browser.newPage();
        sess.pages.push(page);

        await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36');
        await page.setCookie(...cookies);

        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1200);

        const ACCOUNT_TIMEOUT_MS = opts.accountTimeoutMs || 120000;
        await Promise.race([
          runFlowOnPage(page, found.steps, { sessionId, perActionDelay: opts.perActionDelay || 1200 }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Account timeout')), ACCOUNT_TIMEOUT_MS))
        ]);

        sseSend(sessionId, 'success', { account: accId, msg: 'Flow completed' });

        await page.close();
        sess.pages = sess.pages.filter(p => p !== page);
      } catch (err) {
        sseSend(sessionId, 'error', { account: accId, error: err.message });
        try { if (page && !page.isClosed()) await page.close(); } catch {}
        sess.pages = sess.pages.filter(p => p !== page);
      }

      await new Promise(res => setTimeout(res, (opts.gapMs || 2500) + Math.floor(Math.random() * 2000)));
    }

    await browser.close();
    sess.browser = null;
    sess.pages = [];
    sseSend(sessionId, 'done', { msg: 'Runner finished' });
  } catch (e) {
    sseSend(sessionId, 'fatal', { msg: e.message || String(e) });
  } finally {
    sess.running = false;
    sess.abort = false;
  }
}

// === Routes ===
app.get('/events', (req, res) => {
  const sid = req.query.sessionId || 'default';
  const sess = getSession(sid);
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.flushHeaders();
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: 'SSE connected', sessionId: sid })}\n\n`);
  sess.clients.add(res);
  req.on('close', () => sess.clients.delete(res));
});

app.post('/uploadCookies', upload.single('cookies'), (req, res) => {
  try {
    if (req.file) return res.json({ ok: true, path: req.file.path });
    else if (req.body && req.body.text) {
      const txt = String(req.body.text || '').trim();
      if (!txt) return res.status(400).json({ ok: false, message: 'Empty text' });
      fs.writeFileSync(path.join(UPLOAD_DIR, 'cookies.txt'), txt, 'utf-8');
      return res.json({ ok: true, path: 'uploads/cookies.txt' });
    } else return res.status(400).json({ ok: false, message: 'No file or text' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/start', (req, res) => {
  const body = req.body || {};
  const sessionId = body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (sess.running) return res.status(409).json({ ok: false, message: 'Job already running' });

  if (!body.targetUrl) return res.status(400).json({ ok: false, message: 'targetUrl required' });

  (async () => {
    try {
      await reportRunner(sessionId, body);
    } catch (e) {
      sseSend(sessionId, 'fatal', { msg: e.message || String(e) });
    }
  })();

  res.json({ ok: true, message: 'Job started', sessionId });
});

app.post('/stop', async (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (!sess.running) return res.json({ ok: false, message: 'No active job' });
  sess.abort = true;
  sseSend(sessionId, 'info', { msg: 'Stop requested by user' });

  try {
    for (const p of sess.pages) {
      try { await p.close(); } catch {}
    }
    sess.pages = [];
    if (sess.browser) {
      try { await sess.browser.close(); } catch {}
      sess.browser = null;
    }
  } catch (e) {
    console.error('Error during stop cleanup:', e);
  }

  return res.json({ ok: true, message: 'Stop requested and cleanup attempted' });
});

app.post('/clearLogs', (req, res) => {
  const sid = req.body.sessionId || 'default';
  const sess = getSession(sid);
  sess.logs = [];
  res.json({ ok: true });
});

app.get('/status', (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  res.json({ running: sess.running, abort: sess.abort, logs: sess.logs.slice(-200) });
});

app.get('/exampleCookies', (req, res) => {
  res.type('text/plain').send('fr=...; xs=...; c_user=1000...; datr=...; sb=...; wd=390x844;');
});

// === Global error handling ===
app.use((err, req, res, next) => {
  console.error('Uncaught server error:', err);
  try { res.status(500).json({ ok: false, message: err.message || 'Server error' }); } catch {}
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  simpleLog('unhandledRejection', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  simpleLog('uncaughtException', err && err.stack || err);
  setTimeout(() => process.exit(1), 5000);
});
process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down gracefully');
  simpleLog('SIGINT received');
  for (const [sid, sess] of sessions) {
    if (sess.browser) {
      try { await sess.browser.close(); } catch {}
    }
  }
  process.exit(0);
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
