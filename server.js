// server.js
// Robust Express + Puppeteer automation server
// Place at project root. Install dependencies: express, puppeteer, multer, cors, body-parser

'use strict';

const express = require('express');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const { EventEmitter } = require('events');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// --- Required environment check ---
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (!ADMIN_TOKEN) {
  console.error('FATAL: ADMIN_TOKEN environment variable is NOT set. Set ADMIN_TOKEN before starting.');
  process.exit(1);
}

// Directories
const ROOT = path.resolve(__dirname);
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LOG_DIR = path.join(ROOT, 'logs');
const FLOWS_PATH = path.join(ROOT, 'flows.js');

// Ensure directories exist (sync at startup)
for (const d of [UPLOAD_DIR, PUBLIC_DIR, LOG_DIR]) {
  try { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); } catch (e) { console.error('mkdir error', d, e); process.exit(1); }
}

// --- Logging helpers ---
function simpleLog(...args) {
  try {
    const line = `[${new Date().toISOString()}] ${args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'server.log'), line);
    console.log(...args);
  } catch (e) { console.error('log-write-error', e); }
}

// --- Load flows (optional file) ---
let flows = { profileSets: [], pageSets: [], postSets: [] };
try {
  if (fs.existsSync(FLOWS_PATH)) {
    flows = require(FLOWS_PATH);
    simpleLog('flows loaded', Object.keys(flows || {}));
  } else {
    simpleLog('flows.js not found, using empty sets');
  }
} catch (e) {
  simpleLog('error loading flows.js', e && e.message);
  flows = { profileSets: [], pageSets: [], postSets: [] };
}

// --- Puppeteer setup (try full puppeteer first, then fall back to puppeteer-core if installed) ---
let puppeteerPkg = null;
try {
  puppeteerPkg = require('puppeteer'); // recommended: bundled chromium
  simpleLog('Using puppeteer (full bundle)');
} catch (e) {
  try {
    puppeteerPkg = require('puppeteer-core');
    simpleLog('Using puppeteer-core (no bundled chromium) — ensure CHROMIUM_PATH env var set');
  } catch (e2) {
    simpleLog('ERROR: Neither puppeteer nor puppeteer-core is installed. Install one of them.');
    process.exit(1);
  }
}

// Resolve executable path: env override, then common locations, else rely on puppeteer default (if available)
async function resolveExecutablePath() {
  const envPath = process.env.CHROMIUM_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const commonPaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome'
  ];
  for (const p of commonPaths) {
    try { if (fs.existsSync(p)) return p; } catch (e) {}
  }

  // If using full puppeteer, allow its internal executablePath (it may be present)
  if (puppeteerPkg && typeof puppeteerPkg.executablePath === 'function') {
    try {
      const p = puppeteerPkg.executablePath();
      if (p && fs.existsSync(p)) return p;
    } catch (e) {}
  }

  return null;
}

const DEFAULT_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-gpu'
];

async function launchBrowserWithFallback(opts = {}) {
  const execPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

  const launchOpts = {
    headless: 'new', // Render/Docker এ নতুন flag
    executablePath: execPath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--headless=new'
    ],
    defaultViewport: opts.defaultViewport || { width: 390, height: 844 },
    ignoreHTTPSErrors: true
  };

  simpleLog('Launching chromium from path', execPath);

  return await puppeteerPkg.launch(launchOpts);
}

// --- multer safe storage ---
const sanitize = (name) => String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.floor(Math.random()*10000)}-${sanitize(path.basename(file.originalname))}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ok = /text\/|plain/.test(file.mimetype) || file.originalname.toLowerCase().endsWith('.txt');
    if (!ok) return cb(new Error('Only .txt files allowed'));
    cb(null, true);
  }
});

// --- express middleware ---
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

// --- admin middleware (single source of truth) ---
function requireAdmin(req, res, next) {
  const t = req.headers['x-admin-token'] || req.body.adminToken || req.query.adminToken;
  if (!t || t !== ADMIN_TOKEN) {
    simpleLog('unauthorized attempt', { ip: req.ip, path: req.path });
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
  next();
}

// --- SSE sessions and helpers ---
const sessions = new Map();
function getSession(sid = 'default') {
  if (!sessions.has(sid)) {
    sessions.set(sid, { clients: new Set(), running: false, abort: false, emitter: new EventEmitter(), logs: [], browser: null, pages: [] });
  }
  return sessions.get(sid);
}
function sseSend(sid, event, payload) {
  const sess = getSession(sid);
  const data = { ts: Date.now(), event, payload };
  const pretty = `${new Date().toLocaleTimeString()} ${event} ${JSON.stringify(payload)}`;
  sess.logs.push(pretty);
  if (sess.logs.length > 2000) sess.logs.shift();
  simpleLog('SSE', sid, event, payload);
  for (const res of sess.clients) {
    try {
      if (event && event !== 'message') res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (e) {
      sess.clients.delete(res);
    }
  }
}

// --- cookie parser / loader ---
function parseRawCookieLine(line) {
  if (!line || !line.trim()) return null;
  const parts = line.split(';').map(p => p.trim()).filter(Boolean);
  const cookies = [];
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i === -1) continue;
    const name = p.slice(0, i).trim();
    let value = p.slice(i + 1).trim();
    if (value.length > 500) value = value.slice(0, 500);
    cookies.push({ name, value, domain: '.facebook.com', path: '/', httpOnly: false, secure: true });
  }
  const hasCUser = cookies.some(c => c.name === 'c_user');
  const hasXs = cookies.some(c => c.name === 'xs');
  if (!hasCUser || !hasXs) return null;
  return cookies;
}

function loadCookieAccounts() {
  const out = [];
  const cookieTxt = path.join(UPLOAD_DIR, 'cookies.txt');
  try {
    if (fs.existsSync(cookieTxt)) {
      const lines = fs.readFileSync(cookieTxt, 'utf-8')
  .split(/\r?\n|\r|\n/g)   // সব ধরণের newline কভার করবে
  .map(l => l.trim())
  .filter(Boolean);
      for (const l of lines) {
        const parsed = parseRawCookieLine(l);
        if (parsed) out.push(parsed);
        else simpleLog('cookie-line-skip', l.slice(0,120));
      }
    } else {
      const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.endsWith('.txt'));
      for (const f of files) {
        if (f === 'cookies.txt') continue;
        const content = fs.readFileSync(path.join(UPLOAD_DIR, f), 'utf-8').trim();
        if (!content) continue;
        const parsed = parseRawCookieLine(content);
        if (parsed) out.push(parsed);
        else simpleLog('cookie-file-skip', f);
      }
    }
  } catch (e) {
    simpleLog('loadCookieAccounts-error', e && e.message);
  }
  return out;
}

// --- helpers for clicking with fallbacks ---
async function tryClickCss(page, sel, timeout = 3000) {
  try {
    await page.waitForSelector(sel, { timeout });
    const el = await page.$(sel);
    if (!el) throw new Error('no-el-css');
    await page.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }), el);
    await el.click({ delay: 80 });
    return true;
  } catch (e) { return false; }
}
async function tryClickXpath(page, sel, timeout = 3000) {
  try {
    await page.waitForXPath(sel, { timeout });
    const els = await page.$x(sel);
    if (!els || !els.length) throw new Error('no-el-xpath');
    await page.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }), els[0]);
    await els[0].click({ delay: 80 });
    return true;
  } catch (e) { return false; }
}

async function runFlowOnPage(page, flowSteps, opts = {}) {
  const { sessionId = 'default', perActionDelay = 1100, actionTimeout = 12000 } = opts;
  for (const step of flowSteps) {
    if (getSession(sessionId).abort) throw new Error('ABORTED');
    const label = step.label || step.selector || step.text || 'step';
    sseSend(sessionId, 'log', { step: label });

    const sels = Array.isArray(step.selectors) ? step.selectors.slice() : (step.selector ? [step.selector] : []);
    let success = false;

    for (const rawSel of sels) {
      if (!rawSel) continue;
      const sel = String(rawSel).trim();
      if (/^css:/.test(sel)) {
        success = await tryClickCss(page, sel.replace(/^css:/,''), Math.min(actionTimeout, 6000));
      } else if (/^xpath:/.test(sel)) {
        success = await tryClickXpath(page, sel.replace(/^xpath:/,''), Math.min(actionTimeout, 6000));
      } else {
        success = await tryClickCss(page, sel, 3000);
        if (!success) success = await tryClickXpath(page, sel, 3000);
      }
      if (success) break;
    }

    if (!success && step.text) {
      const text = String(step.text).replace(/'/g, "\\'");
      const x = `//*[contains(normalize-space(string(.)),'${text}')]`;
      success = await tryClickXpath(page, x, Math.min(actionTimeout, 4000));
    }

    if (!success) {
      sseSend(sessionId, 'warn', { step: label, error: 'selector-not-found' });
      if (step.mandatory) throw new Error(`Mandatory step failed: ${label}`);
    } else {
      sseSend(sessionId, 'log', { step: label, ok: true });
    }

    await new Promise(r => setTimeout(r, perActionDelay + Math.floor(Math.random() * 350)));
  }
}

// --- main runner ---
async function reportRunner(sessionId, opts = {}) {
  const sess = getSession(sessionId);
  try {
    sess.running = true; sess.abort = false;

    let cookieAccounts = loadCookieAccounts();
    const MAX_ACCOUNTS = Math.max(1, parseInt(process.env.MAX_ACCOUNTS || '200', 10));
    if (cookieAccounts.length > MAX_ACCOUNTS) cookieAccounts = cookieAccounts.slice(0, MAX_ACCOUNTS);
    if (!cookieAccounts.length) { sseSend(sessionId, 'error', { msg: 'No cookie accounts found' }); sess.running=false; return; }

    const target = String(opts.targetUrl || opts.target || '').trim();
    if (!target) { sseSend(sessionId, 'error', { msg: 'targetUrl required' }); sess.running=false; return; }

    const kind = (opts.setType || opts.type || 'profile').toLowerCase();
    const sets = kind === 'profile' ? flows.profileSets || [] : kind === 'page' ? flows.pageSets || [] : flows.postSets || [];
    if (!sets.length) { sseSend(sessionId, 'error', { msg: 'No flow sets for ' + kind }); sess.running=false; return; }
    const found = opts.setId ? sets.find(s => s.id === opts.setId || s.name === opts.setId) : sets[0];
    if (!found) { sseSend(sessionId, 'error', { msg: 'Requested set not found' }); sess.running=false; return; }

    // Launch browser (and possibly restart during run)
    async function launchBrowser() {
      return await launchBrowserWithFallback({ headless: !!opts.headless, args: opts.args || [], defaultViewport: opts.defaultViewport });
    }

    let browser = await launchBrowser();
    sess.browser = browser;
    let sinceRestart = 0;
    const RESTART_AFTER = Math.max(5, parseInt(process.env.RESTART_AFTER || '25', 10));

    let accountIndex = 0;
    for (const cookies of cookieAccounts) {
      if (sess.abort) break;
      accountIndex++;
      const accId = cookies.find(c => c.name === 'c_user')?.value || `acct_${accountIndex}`;
      sseSend(sessionId, 'info', { msg: `Account ${accountIndex}`, account: accId });

      let page = null;
      try {
        if (sinceRestart >= RESTART_AFTER) {
          try { await browser.close(); } catch (e) { simpleLog('browser-close-error', e && e.message); }
          browser = await launchBrowser();
          sess.browser = browser;
          sinceRestart = 0;
          sseSend(sessionId, 'info', { msg: 'Browser restarted to avoid memory leak' });
        }

        page = await browser.newPage();
        sess.pages.push(page);
        // <-- ADD THESE 3 LINES IMMEDIATELY AFTER newPage()
        global.page = page; // expose current page for debug endpoints
        simpleLog('page-created-for-account', accId);
        
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36');

        // prepare context before setting cookies
        await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
        await page.setCookie(...cookies);

      
        // goto target
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // log current url for debug (will show in render logs)
        try {
          const curUrl = await page.url();
          simpleLog('Page navigated', { account: accId, url: curUrl });
          sseSend(sessionId, 'info', { msg: 'page-url', url: curUrl });
        } catch(e) { simpleLog('page-url-error', e && e.message); }

        await page.waitForTimeout(1200 + Math.floor(Math.random() * 800));

        const ACCOUNT_TIMEOUT_MS = Math.max(30_000, parseInt(process.env.ACCOUNT_TIMEOUT_MS || '90000', 10));
        await Promise.race([
          runFlowOnPage(page, found.steps, { sessionId, perActionDelay: opts.perActionDelay || 1200, actionTimeout: opts.actionTimeout || 12000 }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Account timeout')), ACCOUNT_TIMEOUT_MS))
        ]);

        sseSend(sessionId, 'success', { account: accId, msg: 'Flow completed' });

        // after successful flow complete
        try { await page.close(); } catch (e) {}
        sess.pages = sess.pages.filter(p => p !== page);
        global.page = null;
      } catch (err) {
        sseSend(sessionId, 'error', { account: accId, error: err && err.message ? err.message : String(err) });
        try { if (page && !page.isClosed()) await page.close(); } catch (e) {}
        sess.pages = sess.pages.filter(p => p !== page);
        global.page = null;
      }

      sinceRestart++;
      await new Promise(r => setTimeout(r, (opts.gapMs || 2500) + Math.floor(Math.random() * 2000)));
    }

    try { await browser.close(); } catch (e) {}
    sess.browser = null; sess.pages = [];
    sseSend(sessionId, 'done', { msg: 'Runner finished' });
  } catch (e) {
    sseSend(sessionId, 'fatal', { msg: e && e.message ? e.message : String(e) });
    simpleLog('reportRunner-fatal', e && e.stack ? e.stack : String(e));
  } finally {
    const s = getSession(sessionId);
    s.running = false; s.abort = false;
  }
}

// --- API routes ---

// --- Debug endpoints (admin only) ---
// GET /debug-screenshot  => returns PNG of current page
app.get('/debug-screenshot', requireAdmin, async (req, res) => {
  if (!global.page) return res.status(400).send('No active page');
  try {
    const buf = await global.page.screenshot({ fullPage: false });
    res.set('Content-Type', 'image/png');
    res.send(buf);
  } catch (e) {
    simpleLog('debug-screenshot-error', e && e.message);
    res.status(500).send('Screenshot error: ' + (e && e.message || 'err'));
  }
});

// GET /debug-html => returns current page HTML (plain text)
app.get('/debug-html', requireAdmin, async (req, res) => {
  if (!global.page) return res.status(400).send('No active page');
  try {
    const html = await global.page.content();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(html);
  } catch (e) {
    simpleLog('debug-html-error', e && e.message);
    res.status(500).send('HTML error: ' + (e && e.message || 'err'));
  }
});

// Expose flows
app.get('/flows', (req, res) => { res.json(flows); });

// SSE endpoint
app.get('/events', (req, res) => {
  const sid = req.query.sessionId || 'default';
  const sess = getSession(sid);
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.flushHeaders();
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: 'SSE connected', sessionId: sid })}\n\n`);
  sess.clients.add(res);
  req.on('close', () => { sess.clients.delete(res); });
});

// Upload cookies (admin)
app.post('/uploadCookies', requireAdmin, upload.single('cookies'), async (req, res) => {
  try {
    if (req.file) {
      const target = path.join(UPLOAD_DIR, 'cookies.txt');
      await fsp.copyFile(req.file.path, target);
      try { await fsp.unlink(req.file.path); } catch (_) {}
      simpleLog('cookies uploaded file -> cookies.txt');
      return res.json({ ok: true, path: 'uploads/cookies.txt' });
    } else if (req.body && req.body.text) {
      const txt = String(req.body.text || '').trim();
      if (!txt) return res.status(400).json({ ok: false, message: 'Empty text' });
      await fsp.writeFile(path.join(UPLOAD_DIR, 'cookies.txt'), txt, 'utf-8');
      simpleLog('cookies uploaded via text');
      return res.json({ ok: true, path: 'uploads/cookies.txt' });
    } else {
      return res.status(400).json({ ok: false, message: 'No file or text' });
    }
  } catch (e) {
    simpleLog('uploadCookies-error', e && e.message);
    return res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) });
  }
});

// Start runner (admin) - starts reportRunner in background
app.post('/start', requireAdmin, (req, res) => {
  const body = req.body || {};
  const sessionId = body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (sess.running) return res.status(409).json({ ok: false, message: 'Job already running' });
  if (!body.targetUrl && !body.target) return res.status(400).json({ ok: false, message: 'targetUrl required' });

  (async () => {
    try { await reportRunner(sessionId, body); } catch (e) { sseSend(sessionId, 'fatal', { msg: e && e.message ? e.message : String(e) }); }
  })();

  res.json({ ok: true, message: 'Job started', sessionId });
});

// Stop runner (admin)
app.post('/stop', requireAdmin, async (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (!sess.running) return res.json({ ok: false, message: 'No active job' });
  sess.abort = true;
  sseSend(sessionId, 'info', { msg: 'Stop requested by user' });

  try {
    for (const p of sess.pages) {
      try { await p.close(); } catch (e) {}
    }
    sess.pages = [];
    if (sess.browser) { try { await sess.browser.close(); } catch (e) {} sess.browser = null; }
  } catch (e) {
    simpleLog('stop-cleanup-error', e && e.message);
  }
  return res.json({ ok: true, message: 'Stop requested and cleanup attempted' });
});

// Clear logs (admin)
app.post('/clearLogs', requireAdmin, (req, res) => {
  const sid = req.body.sessionId || 'default';
  const sess = getSession(sid);
  sess.logs = [];
  res.json({ ok: true });
});

// Status (admin)
app.get('/status', requireAdmin, (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  res.json({ running: sess.running, abort: sess.abort, logs: sess.logs.slice(-200) });
});

// Example cookies format (public)
app.get('/exampleCookies', (req, res) => {
  res.type('text/plain').send('fr=...; xs=...; c_user=1000...; datr=...; sb=...; wd=390x844;');
});

// Basic /report endpoint that accepts a job (admin-protected)
app.post('/report', requireAdmin, express.json({ limit: '2mb' }), (req, res) => {
  const { type, target, options, cookies } = req.body;
  if (!type || !target) return res.status(400).json({ ok: false, message: 'type and target required' });

  simpleLog('New job received', { type, target, optionsSample: Array.isArray(options) ? options.slice(0,5) : options });
  // respond quickly — actual processing handled by start route / runner
  res.json({ ok: true, message: 'Job accepted' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Uncaught server error:', err);
  simpleLog('uncaught-server-error', err && err.message ? err.message : String(err));
  try { res.status(500).json({ ok: false, message: err.message || 'Server error' }); } catch (e) {}
});

// handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason) => { console.error('Unhandled Rejection:', reason); simpleLog('unhandledRejection', String(reason)); });
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); simpleLog('uncaughtException', err && err.stack || String(err)); setTimeout(() => process.exit(1), 5000); });

// graceful shutdown
async function gracefulShutdown() {
  simpleLog('Graceful shutdown initiated');
  for (const [sid, sess] of sessions.entries()) {
    try {
      sess.abort = true;
      for (const p of sess.pages) { try { await p.close(); } catch (e) {} }
      if (sess.browser) { try { await sess.browser.close(); } catch (e) {} }
    } catch (e) { /* ignore */ }
  }
  process.exit(0);
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
app.listen(PORT, () => {
  simpleLog(`🚀 Server listening on port ${PORT}`);
  console.log(`Server ready on port ${PORT}`);
});
