// server.js
// Robust Express + Puppeteer automation server
// Put this file at project root

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

// ensure folders
for (const d of [UPLOAD_DIR, PUBLIC_DIR, LOG_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

// flows.js
const FLOWS_PATH = path.join(ROOT, 'flows.js');
let flows = {};
try { flows = require(FLOWS_PATH); } catch (e) { flows = { profileSets: [], pageSets: [], postSets: [] }; console.warn('flows.js missing or invalid'); }

// Admin token (set env ADMIN_TOKEN for production)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_me_now';

// --- multer safe storage ---
const sanitize = (name) => String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.floor(Math.random()*10000)}-${sanitize(path.basename(file.originalname))}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const ok = /text\/|plain/.test(file.mimetype) || file.originalname.toLowerCase().endsWith('.txt');
    if (!ok) return cb(new Error('Only .txt files allowed'));
    cb(null, true);
  }
});

// --- middlewares ---
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

function requireAdmin(req, res, next) {
  const t = req.headers['x-admin-token'] || req.body.adminToken || req.query.adminToken;
  if (t !== ADMIN_TOKEN) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  next();
}

// --- sessions / SSE / logging ---
const sessions = new Map();
function getSession(sid = 'default') {
  if (!sessions.has(sid)) {
    sessions.set(sid, { clients: new Set(), running: false, abort: false, emitter: new EventEmitter(), logs: [], browser: null, pages: [] });
  }
  return sessions.get(sid);
}
function simpleLog(...args) {
  const line = `[${new Date().toISOString()}] ${args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`;
  fs.appendFileSync(path.join(LOG_DIR, 'server.log'), line);
}
function sseSend(sid, event, payload) {
  const sess = getSession(sid);
  const data = { ts: Date.now(), event, payload };
  sess.logs.push(`${new Date().toLocaleTimeString()} ${event} ${JSON.stringify(payload)}`);
  if (sess.logs.length > 2000) sess.logs.shift();
  simpleLog(event, payload);
  for (const res of sess.clients) {
    try {
      if (event && event !== 'message') res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (e) { sess.clients.delete(res); }
  }
}

// --- cookie parser ---
function parseRawCookieLine(line) {
  if (!line || !line.trim()) return null;
  const parts = line.split(';').map(p => p.trim()).filter(Boolean);
  const cookies = [];
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i === -1) continue;
    const name = p.slice(0, i).trim();
    let value = p.slice(i + 1).trim();
    // keep raw value (no decode) — ensure reasonable length
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
  if (fs.existsSync(cookieTxt)) {
    const lines = fs.readFileSync(cookieTxt, 'utf-8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
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
  return out;
}

// --- helpers for selector attempts ---
async function tryClickCss(page, sel, timeout) {
  try {
    await page.waitForSelector(sel, { timeout });
    const el = await page.$(sel);
    if (!el) throw new Error('no-el-css');
    await page.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }), el);
    await el.click({ delay: 80 });
    return true;
  } catch (e) { return false; }
}
async function tryClickXpath(page, sel, timeout) {
  try {
    await page.waitForXPath(sel, { timeout });
    const els = await page.$x(sel);
    if (!els || !els.length) throw new Error('no-el-xpath');
    await page.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }), els[0]);
    await els[0].click({ delay: 80 });
    return true;
  } catch (e) { return false; }
}

// --- runFlowOnPage: tries css/xpath/text fallbacks; step can have selectors array ---
async function runFlowOnPage(page, flowSteps, opts = {}) {
  const { sessionId, perActionDelay = 1100, actionTimeout = 12000 } = opts;
  for (const step of flowSteps) {
    if (getSession(sessionId).abort) throw new Error('ABORTED');
    const label = step.label || step.selector || 'step';
    sseSend(sessionId, 'log', { step: label });

    // accept step.selectors (array) OR step.selector (string)
    const sels = Array.isArray(step.selectors) ? step.selectors.slice() : (step.selector ? [step.selector] : []);
    let success = false;
    let lastErr = null;

    for (const rawSel of sels) {
      if (!rawSel) continue;
      const sel = String(rawSel).trim();
      // typed prefixes
      if (/^css:/.test(sel)) {
        success = await tryClickCss(page, sel.replace(/^css:/, ''), Math.min(actionTimeout, 6000));
      } else if (/^xpath:/.test(sel)) {
        success = await tryClickXpath(page, sel.replace(/^xpath:/, ''), Math.min(actionTimeout, 6000));
      } else {
        // try css then xpath with short timeouts
        success = await tryClickCss(page, sel, 3000);
        if (!success) success = await tryClickXpath(page, sel, 3000);
      }
      if (success) break;
    }

    // text fallback if configured
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

// --- reportRunner: iterate accounts intelligently, restart browser periodically ---
async function reportRunner(sessionId, opts = {}) {
  const sess = getSession(sessionId);
  try {
    sess.running = true; sess.abort = false;

    let cookieAccounts = loadCookieAccounts();
    const MAX_ACCOUNTS = Math.max(1, parseInt(process.env.MAX_ACCOUNTS || '200', 10));
    if (cookieAccounts.length > MAX_ACCOUNTS) cookieAccounts = cookieAccounts.slice(0, MAX_ACCOUNTS);
    if (!cookieAccounts.length) { sseSend(sessionId, 'error', { msg: 'No cookie accounts found' }); sess.running=false; return; }

    const target = String(opts.targetUrl || '').trim();
    if (!target) { sseSend(sessionId, 'error', { msg: 'targetUrl required' }); sess.running=false; return; }

    const kind = (opts.setType || 'profile').toLowerCase();
    const sets = kind === 'profile' ? flows.profileSets || [] : kind === 'page' ? flows.pageSets || [] : flows.postSets || [];
    if (!sets.length) { sseSend(sessionId, 'error', { msg: 'No flow sets for ' + kind }); sess.running=false; return; }
    const found = opts.setId ? sets.find(s => s.id === opts.setId || s.name === opts.setId) : sets[0];
    if (!found) { sseSend(sessionId, 'error', { msg: 'Requested set not found' }); sess.running=false; return; }

    // launch browser function
    async function launchBrowser() {
      return await puppeteer.launch({
        headless: !!opts.headless,
        args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
        defaultViewport: { width: 390, height: 844 }
      });
    }

    let browser = await launchBrowser();
    sess.browser = browser;
    let sinceRestart = 0;
    const RESTART_AFTER = Math.max(10, parseInt(process.env.RESTART_AFTER || '25', 10));

    let accountIndex = 0;
    for (const cookies of cookieAccounts) {
      if (sess.abort) break;
      accountIndex++;
      const accId = cookies.find(c => c.name === 'c_user')?.value || `acct_${accountIndex}`;
      sseSend(sessionId, 'info', { msg: `Account ${accountIndex}`, account: accId });

      let page = null;
      try {
        // restart if too many accounts handled
        if (sinceRestart >= RESTART_AFTER) {
          try { await browser.close(); } catch (e) {}
          browser = await launchBrowser();
          sess.browser = browser;
          sinceRestart = 0;
          sseSend(sessionId, 'info', { msg: 'Browser restarted to avoid memory leak' });
        }

        page = await browser.newPage();
        sess.pages.push(page);
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36');

        // ensure page context before setCookie
        await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        await page.setCookie(...cookies);

        // goto target
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1200 + Math.floor(Math.random() * 800));

        // per-account timeout
        const ACCOUNT_TIMEOUT_MS = Math.max(30_000, parseInt(process.env.ACCOUNT_TIMEOUT_MS || '90000', 10));
        await Promise.race([
          runFlowOnPage(page, found.steps, { sessionId, perActionDelay: opts.perActionDelay || 1200, actionTimeout: opts.actionTimeout || 12000 }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Account timeout')), ACCOUNT_TIMEOUT_MS))
        ]);

        sseSend(sessionId, 'success', { account: accId, msg: 'Flow completed' });

        try { await page.close(); } catch (e) {}
        sess.pages = sess.pages.filter(p => p !== page);
      } catch (err) {
        sseSend(sessionId, 'error', { account: accId, error: err && err.message ? err.message : String(err) });
        try { if (page && !page.isClosed()) await page.close(); } catch (e) {}
        sess.pages = sess.pages.filter(p => p !== page);
      }

      sinceRestart++;
      await new Promise(r => setTimeout(r, (opts.gapMs || 2500) + Math.floor(Math.random() * 2000)));
    } // end accounts loop

    try { await browser.close(); } catch (e) {}
    sess.browser = null; sess.pages = [];
    sseSend(sessionId, 'done', { msg: 'Runner finished' });
  } catch (e) {
    sseSend(sessionId, 'fatal', { msg: e.message || String(e) });
  } finally {
    const s = getSession(sessionId);
    s.running = false; s.abort = false;
  }
}

// --- routes ---

// expose flows to client
app.get('/flows', (req, res) => { res.json(flows); });

// SSE
app.get('/events', (req, res) => {
  const sid = req.query.sessionId || 'default';
  const sess = getSession(sid);
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.flushHeaders();
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: 'SSE connected', sessionId: sid })}\n\n`);
  sess.clients.add(res);
  req.on('close', () => { sess.clients.delete(res); });
});

// upload cookies (admin)
app.post('/uploadCookies', requireAdmin, upload.single('cookies'), (req, res) => {
  try {if (req.file) {
  try {
    const target = path.join(UPLOAD_DIR, 'cookies.txt');
    // overwrite cookies.txt with uploaded file content
    fs.copyFileSync(req.file.path, target);
    // optional: remove original upload if you want
    try { fs.unlinkSync(req.file.path); } catch(e){}
    return res.json({ ok: true, path: 'uploads/cookies.txt' });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
    else if (req.body && req.body.text) {
      const txt = String(req.body.text || '').trim();
      if (!txt) return res.status(400).json({ ok: false, message: 'Empty text' });
      fs.writeFileSync(path.join(UPLOAD_DIR, 'cookies.txt'), txt, 'utf-8');
      return res.json({ ok: true, path: 'uploads/cookies.txt' });
    } else return res.status(400).json({ ok: false, message: 'No file or text' });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
});

// start (admin)
app.post('/start', requireAdmin, (req, res) => {
  const body = req.body || {};
  const sessionId = body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (sess.running) return res.status(409).json({ ok: false, message: 'Job already running' });
  if (!body.targetUrl) return res.status(400).json({ ok: false, message: 'targetUrl required' });

  (async () => {
    try { await reportRunner(sessionId, body); } catch (e) { sseSend(sessionId, 'fatal', { msg: e.message || String(e) }); }
  })();

  res.json({ ok: true, message: 'Job started', sessionId });
});

// stop (admin)
app.post('/stop', requireAdmin, async (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (!sess.running) return res.json({ ok: false, message: 'No active job' });
  sess.abort = true;
  sseSend(sessionId, 'info', { msg: 'Stop requested by user' });
  try {
    for (const p of sess.pages) { try { await p.close(); } catch {} }
    sess.pages = [];
    if (sess.browser) { try { await sess.browser.close(); } catch {} sess.browser = null; }
  } catch (e) { simpleLog('stop-cleanup-error', e); }
  return res.json({ ok: true, message: 'Stop requested and cleanup attempted' });
});

app.post('/clearLogs', requireAdmin, (req, res) => {
  const sid = req.body.sessionId || 'default';
  const sess = getSession(sid);
  sess.logs = [];
  res.json({ ok: true });
});

app.get('/status', requireAdmin, (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  res.json({ running: sess.running, abort: sess.abort, logs: sess.logs.slice(-200) });
});

app.get('/exampleCookies', (req, res) => {
  res.type('text/plain').send('fr=...; xs=...; c_user=1000...; datr=...; sb=...; wd=390x844;');
});

// global error handlers
app.use((err, req, res, next) => {
  console.error('Uncaught server error:', err);
  try { res.status(500).json({ ok: false, message: err.message || 'Server error' }); } catch (e) {}
});

process.on('unhandledRejection', (reason, p) => { console.error('Unhandled Rejection:', reason); simpleLog('unhandledRejection', reason); });
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); simpleLog('uncaughtException', err && err.stack || err); setTimeout(() => process.exit(1), 5000); });

app.listen(PORT, () => { console.log(`🚀 Server listening on http://localhost:${PORT}`); });
