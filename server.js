// server.js
// Robust Express + Puppeteer automation server (session-scoped debug endpoints)
// Install: npm install express puppeteer multer cors body-parser

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

// --- required env ---
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
if (!ADMIN_TOKEN) {
  console.error('FATAL: ADMIN_TOKEN not set. export ADMIN_TOKEN="your-token"');
  process.exit(1);
}

// dirs
const ROOT = path.resolve(__dirname);
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LOG_DIR = path.join(ROOT, 'logs');
const FLOWS_PATH = path.join(ROOT, 'flows.js');

// ensure dirs
for (const d of [UPLOAD_DIR, PUBLIC_DIR, LOG_DIR]) {
  try { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); } catch (e) { console.error('mkdir error', d, e); process.exit(1); }
}

// logging helper
function simpleLog(...args) {
  try {
    const line = `[${new Date().toISOString()}] ${args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'server.log'), line);
    console.log(...args);
  } catch (e) { console.error('log-write-error', e); }
}

// load flows (optional)
let flows = { profileSets: [], pageSets: [], postSets: [] };
try {
  if (fs.existsSync(FLOWS_PATH)) {
    flows = require(FLOWS_PATH);
    simpleLog('flows loaded', Object.keys(flows || {}));
  } else simpleLog('flows.js not found, using empty sets');
} catch (e) {
  simpleLog('error loading flows.js', e && e.message);
  flows = { profileSets: [], pageSets: [], postSets: [] };
}

// puppeteer / puppeteer-core detection
let puppeteerPkg = null;
try {
  puppeteerPkg = require('puppeteer'); // preferred (bundled chromium)
  simpleLog('Using puppeteer (bundle)');
} catch (e) {
  try {
    puppeteerPkg = require('puppeteer-core'); // fallback
    simpleLog('Using puppeteer-core (no bundle)');
  } catch (e2) {
    simpleLog('ERROR: install puppeteer or puppeteer-core');
    process.exit(1);
  }
}

// resolve executable path intelligently
async function resolveExecutablePath() {
  const envPath = process.env.CHROMIUM_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const commonPaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/opt/google/chrome/chrome'
  ];
  for (const p of commonPaths) {
    try { if (fs.existsSync(p)) return p; } catch(_) {}
  }

  // if full puppeteer is present, try its executablePath() helper
  try {
    if (puppeteerPkg && typeof puppeteerPkg.executablePath === 'function') {
      const p = puppeteerPkg.executablePath();
      if (p && fs.existsSync(p)) return p;
    }
  } catch(_) {}

  return null;
}

const DEFAULT_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-gpu'
];

// launch wrapper using resolver; respects env PUPPETEER_HEADLESS
async function launchBrowserWithFallback(opts = {}) {
  const execPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROMIUM_PATH || await resolveExecutablePath();

  const launchOpts = {
    headless: 'new',
    executablePath: execPath || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
    ].concat(opts.args || []),
    defaultViewport: opts.defaultViewport || { width: 390, height: 844 },
    ignoreHTTPSErrors: true
  };

  simpleLog('Launching chromium from', execPath || 'puppeteer default');
  try {
    return await puppeteerPkg.launch(launchOpts);
  } catch (err) {
    simpleLog('puppeeter.launch failed:', err && err.message);
    throw err;
  }
}

// --- Quick cookie validator helper ---
/**
 * Quick validate cookies using a short headless browser session.
 * - cookies: array of puppeteer cookie objects ({name, value, domain, path, ...})
 * - sessionId: SSE session id to send logs
 * Returns: { status: 'live'|'invalid'|'error', reason?: string, url?:string }
 */
async function quickValidateCookie(cookies, sessionId) {
  let browser = null;
  let page = null;
  const start = Date.now();
  try {
    // launch a small headless browser instance
    browser = await launchBrowserWithFallback({ args: ['--no-sandbox','--disable-setuid-sandbox'], defaultViewport: { width: 360, height: 800 } });
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36');

    // navigate to a safe base first
    await page.goto('https://m.facebook.com', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
    // set cookies
    try {
      await page.setCookie(...cookies);
    } catch (e) {
      sseSend(sessionId, 'log', { msg: 'quickValidate: cookie set failed', error: e && e.message });
      return { status: 'error', reason: 'cookie-set-failed' };
    }

    // navigate again so cookies take effect
    await page.goto('https://m.facebook.com', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});

    // small wait for any client side rendering
    await page.waitForTimeout(1200);

    // grab content (text) and url
let curUrl = null;
let html = '';
try { curUrl = page.url(); } catch(_) { curUrl = null; }
try { html = await page.content(); } catch(_) { html = ''; }
    const lower = String(html).toLowerCase();
    const loginHints = [
      'log in to see posts',
      'log in to see', 'log in', 'create new account', 'password', 'sign up', 'please log in'
    ];
    let flaggedLogin = false;
    for (const h of loginHints) {
      if (lower.includes(h)) { flaggedLogin = true; break; }
    }

    const urlLogin = curUrl && (/\/login|\/checkpoint|\/home\.php/.test(curUrl));

    if (flaggedLogin || urlLogin) {
      sseSend(sessionId, 'log', { msg: 'quickValidate result: invalid (login detected)', url: curUrl });
      await page.close().catch(()=>{});
      await browser.close().catch(()=>{});
      return { status: 'invalid', reason: 'login-prompt-or-redirect', url: curUrl };
    }

    const hasProfileMarker = lower.includes('see more from') || lower.includes('profile photo') || /\/p\/[A-Za-z0-9\-]+/.test(lower);
    if (hasProfileMarker) {
      sseSend(sessionId, 'log', { msg: 'quickValidate result: live (profile markers found)', url: curUrl });
      await page.close().catch(()=>{});
      await browser.close().catch(()=>{});
      return { status: 'live', reason: 'profile-markers', url: curUrl };
    }

    sseSend(sessionId, 'log', { msg: 'quickValidate fallback: considered live', url: curUrl });
    await page.close().catch(()=>{});
    await browser.close().catch(()=>{});
    return { status: 'live', reason: 'no-login-detected', url: curUrl };

  } catch (e) {
    try { if (page && !page.isClosed()) await page.close(); } catch(_) {}
    try { if (browser) await browser.close(); } catch(_) {}
    sseSend(sessionId, 'log', { msg:'quickValidate error', error: e && e.message ? e.message : String(e) });
    return { status: 'error', reason: e && e.message ? e.message : String(e) };
  } finally {
    const took = Date.now() - start;
    sseSend(sessionId, 'log', { msg: 'quickValidate took ms', ms: took });
  }
}

// multer storage
const sanitize = (name) => String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.floor(Math.random()*10000)}-${sanitize(path.basename(file.originalname))}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /text\/|plain/.test(file.mimetype) || file.originalname.toLowerCase().endsWith('.txt');
    if (!ok) return cb(new Error('Only .txt allowed'));
    cb(null, true);
  }
});

// express middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

// admin middleware
function requireAdmin(req, res, next) {
  const t = req.headers['x-admin-token'] || req.body.adminToken || req.query.adminToken;
  if (!t || t !== ADMIN_TOKEN) {
    simpleLog('unauthorized', { ip: req.ip, path: req.path });
    return res.status(401).json({ ok:false, message:'Unauthorized' });
  }
  next();
}

// SSE sessions
const sessions = new Map();
function getSession(sid = 'default') {
  if (!sessions.has(sid)) {
    sessions.set(sid, {
      clients: new Set(),
      running: false,
      abort: false,
      emitter: new EventEmitter(),
      logs: [],
      browser: null,
      pages: [],
      currentPage: null,
      // store parsed cookie lines and validation results
      parsedCookies: []
    });
  }
  return sessions.get(sid);
}
function sseSend(sid, event, payload) {
  const sess = getSession(sid);
  const pretty = `${new Date().toLocaleTimeString()} ${event} ${JSON.stringify(payload)}`;
  sess.logs.push(pretty);
  if (sess.logs.length > 2000) sess.logs.shift();
  simpleLog('SSE', sid, event, payload);
  for (const res of sess.clients) {
    try {
      if (event && event !== 'message') res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (e) { sess.clients.delete(res); }
  }
}

// cookie parser & loader
function parseRawCookieLine(line) {
  if (!line || !line.trim()) return null;
  const parts = line.split(';').map(p => p.trim()).filter(Boolean);
  const cookies = [];
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i === -1) continue;
    const name = p.slice(0, i).trim();
    let value = p.slice(i+1).trim();
    if (value.length > 500) value = value.slice(0,500);
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
      const lines = fs.readFileSync(cookieTxt, 'utf-8').split(/\r?\n|\r|\n/g).map(l => l.trim()).filter(Boolean);
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
  } catch (e) { simpleLog('loadCookieAccounts-error', e && e.message); }
  return out;
}

// click helpers
async function tryClickCss(page, sel, timeout = 3000) {
  try {
    await page.waitForSelector(sel, { timeout });
    const el = await page.$(sel);
    if (!el) throw new Error('no-el-css');
    await page.evaluate(el => el.scrollIntoView({ block:'center', inline:'center' }), el);
    await el.click({ delay: 80 });
    return true;
  } catch (e) { return false; }
}
async function tryClickXpath(page, sel, timeout = 3000) {
  try {
    await page.waitForXPath(sel, { timeout });
    const els = await page.$x(sel);
    if (!els || !els.length) throw new Error('no-el-xpath');
    await page.evaluate(el => el.scrollIntoView({ block:'center', inline:'center' }), els[0]);
    await els[0].click({ delay: 80 });
    return true;
  } catch (e) { return false; }
}

async function runFlowOnPage(page, flowSteps, opts = {}) {
  const { sessionId='default', perActionDelay=1100, actionTimeout=12000 } = opts;
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
        success = await tryClickCss(page, sel.replace(/^css:/,''), Math.min(actionTimeout,6000));
      } else if (/^xpath:/.test(sel)) {
        success = await tryClickXpath(page, sel.replace(/^xpath:/,''), Math.min(actionTimeout,6000));
      } else {
        success = await tryClickCss(page, sel, 3000);
        if (!success) success = await tryClickXpath(page, sel, 3000);
      }
      if (success) break;
    }
    if (!success && step.text) {
      const text = String(step.text).replace(/'/g,"\\'");
      const x = `//*[contains(normalize-space(string(.)),'${text}')]`;
      success = await tryClickXpath(page, x, Math.min(actionTimeout,4000));
    }
    if (!success) {
      sseSend(sessionId, 'warn', { step: label, error: 'selector-not-found' });
      if (step.mandatory) throw new Error(`Mandatory step failed: ${label}`);
    } else {
      sseSend(sessionId, 'log', { step: label, ok: true });
    }
    await new Promise(r => setTimeout(r, perActionDelay + Math.floor(Math.random()*350)));
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
    if (!cookieAccounts.length) { sseSend(sessionId,'error',{msg:'No cookie accounts found'}); sess.running=false; return; }

    const target = String(opts.targetUrl || opts.target || '').trim();
    if (!target) { sseSend(sessionId,'error',{msg:'targetUrl required'}); sess.running=false; return; }

    const kind = (opts.setType || opts.type || 'profile').toLowerCase();
    const sets = kind === 'profile' ? flows.profileSets || [] : kind === 'page' ? flows.pageSets || [] : flows.postSets || [];
    if (!sets.length) { sseSend(sessionId,'error',{msg:'No flow sets for '+kind}); sess.running=false; return; }
    const found = opts.setId ? sets.find(s => s.id===opts.setId || s.name===opts.setId) : sets[0];
    if (!found) { sseSend(sessionId,'error',{msg:'Requested set not found'}); sess.running=false; return; }

    async function launchBrowser() {
      return await launchBrowserWithFallback({ headless: !!opts.headless, args: opts.args || [], defaultViewport: opts.defaultViewport });
    }

    let browser = await launchBrowser();
    sess.browser = browser;
    let sinceRestart = 0;
    const RESTART_AFTER = Math.max(5, parseInt(process.env.RESTART_AFTER || '25',10));

    let accountIndex = 0;
    for (const cookies of cookieAccounts) {
      if (sess.abort) break;
      accountIndex++;
      const accId = cookies.find(c => c.name === 'c_user')?.value || `acct_${accountIndex}`;
      sseSend(sessionId, 'info', { msg:`Account ${accountIndex}`, account: accId });

      let page = null;
      try {
        if (sinceRestart >= RESTART_AFTER) {
          try { await browser.close(); } catch(e){ simpleLog('browser-close-error', e && e.message); }
          browser = await launchBrowser();
          sess.browser = browser;
          sinceRestart = 0;
          sseSend(sessionId,'info',{msg:'Browser restarted to avoid memory leak'});
        }

        page = await browser.newPage();
        sess.pages.push(page);
        sess.currentPage = page;
        simpleLog('page-created-for-account', accId);

        await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36');

        await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
        await page.setCookie(...cookies);

        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
        try { const curUrl = await page.url(); simpleLog('Page navigated', { account: accId, url: curUrl }); sseSend(sessionId,'info',{msg:'page-url',url:curUrl}); } catch(e){}

        await page.waitForTimeout(1200 + Math.floor(Math.random()*800));

        const ACCOUNT_TIMEOUT_MS = Math.max(30_000, parseInt(process.env.ACCOUNT_TIMEOUT_MS || '90000',10));
        await Promise.race([
          runFlowOnPage(page, found.steps, { sessionId, perActionDelay: opts.perActionDelay || 1200, actionTimeout: opts.actionTimeout || 12000 }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Account timeout')), ACCOUNT_TIMEOUT_MS))
        ]);

        sseSend(sessionId, 'success', { account: accId, msg: 'Flow completed' });

        try { await page.close(); } catch(e){}
        sess.pages = sess.pages.filter(p => p !== page);
        sess.currentPage = null;
      } catch (err) {
        sseSend(sessionId,'error',{account: accId, error: err && err.message ? err.message : String(err)});
        try { if (page && !page.isClosed()) await page.close(); } catch(e){}
        sess.pages = sess.pages.filter(p => p !== page);
        sess.currentPage = null;
      }

      sinceRestart++;
      await new Promise(r => setTimeout(r, (opts.gapMs || 2500) + Math.floor(Math.random()*2000)));
    }

    try { await browser.close(); } catch(e){}
    sess.browser = null; sess.pages = []; sess.currentPage = null;
    sseSend(sessionId, 'done', { msg: 'Runner finished' });
  } catch (e) {
    sseSend(sessionId, 'fatal', { msg: e && e.message ? e.message : String(e) });
    simpleLog('reportRunner-fatal', e && e.stack ? e.stack : String(e));
  } finally {
    const s = getSession(sessionId);
    s.running = false; s.abort = false;
  }
}

// --- API & debug endpoints ---

// debug screenshot (session-scoped)
app.get('/debug-screenshot', requireAdmin, async (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  if (!sess.currentPage) return res.status(400).send('No active page for session ' + sessionId);
  try {
    const buf = await sess.currentPage.screenshot({ fullPage: false });
    res.set('Content-Type','image/png');
    res.send(buf);
  } catch (e) {
    simpleLog('debug-screenshot-error', e && e.message);
    res.status(500).send('Screenshot error: ' + (e && e.message || 'err'));
  }
});

// debug html
app.get('/debug-html', requireAdmin, async (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  if (!sess.currentPage) return res.status(400).send('No active page for session ' + sessionId);
  try {
    const html = await sess.currentPage.content();
    res.set('Content-Type','text/plain; charset=utf-8');
    res.send(html);
  } catch (e) {
    simpleLog('debug-html-error', e && e.message);
    res.status(500).send('HTML error: ' + (e && e.message || 'err'));
  }
});

// flows
app.get('/flows', (req, res) => res.json(flows));

// SSE
app.get('/events', (req, res) => {
  const sid = req.query.sessionId || 'default';
  const token = req.query.adminToken || '';
  // requireAdmin is a middleware; EventSource can't set headers easily, so do a quick check
  if (!token || token !== ADMIN_TOKEN) {
    simpleLog('events-unauthorized', { ip: req.ip });
    res.status(401).end('Unauthorized');
    return;
  }

  const sess = getSession(sid);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    // optional: disable buffering proxies
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders();

  // send ready
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: 'SSE connected', sessionId: sid })}\n\n`);
  sess.clients.add(res);

  // keepalive ping every 15s
  const ka = setInterval(() => {
    try { res.write(':\n\n'); } catch (e) { /* ignore */ }
  }, 15000);

  req.on('close', () => {
    clearInterval(ka);
    sess.clients.delete(res);
  });
});

// --- cookieList endpoint to show parsed cookies for a session ---
app.get('/cookieList', requireAdmin, (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  try {
    const list = (sess.parsedCookies || []).slice(); // shallow copy
    const counts = { total: 0, parsed:0, live:0, invalid:0, error:0, other:0 };
    for (const it of list) {
      const st = (it.validateResult && it.validateResult.status) || (it.isAccount ? 'parsed' : 'invalid');
      counts.total++;
      if (st === 'parsed') counts.parsed++;
      else if (st === 'live') counts.live++;
      else if (st === 'invalid') counts.invalid++;
      else if (st === 'error') counts.error++;
      else counts.other++;
    }
    return res.json({ ok:true, total: list.length, counts, cookies: list });
  } catch (e) {
    simpleLog('cookieList-error', e && e.message);
    return res.status(500).json({ ok:false, error: e && e.message });
  }
});

// --- Replace your /uploadCookies handler with this whole block ---
app.post('/uploadCookies', requireAdmin, upload.single('cookies'), async (req, res) => {
  const sessionId = req.query.sessionId || req.body.sessionId || 'default';
  const sess = getSession(sessionId);
  try {
    let raw = '';
    if (req.file) {
      const target = path.join(UPLOAD_DIR, 'cookies.txt');
      await fsp.copyFile(req.file.path, target);
      try { await fsp.unlink(req.file.path); } catch(_) {}
      raw = await fsp.readFile(target, 'utf8');
      sseSend(sessionId, 'log', { msg: 'cookies file saved', file: 'uploads/cookies.txt' });
    } else if (req.body && req.body.text) {
      raw = String(req.body.text || '').trim();
      if (!raw) return res.status(400).json({ ok:false, message:'Empty text' });
      await fsp.writeFile(path.join(UPLOAD_DIR,'cookies.txt'), raw, 'utf8');
      sseSend(sessionId, 'log', { msg: 'cookies written from text' });
    } else {
      return res.status(400).json({ ok:false, message:'No file or text' });
    }

    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) {
      sseSend(sessionId, 'warn', { msg: 'No cookie lines found in file' });
      return res.json({ ok:true, parsed: 0 });
    }

    function parseLineToKv(line) {
      const parts = line.split(';').map(p => p.trim()).filter(Boolean);
      const kv = {};
      for (const p of parts) {
        const idx = p.indexOf('=');
        if (idx === -1) continue;
        const k = p.slice(0, idx).trim();
        const v = p.slice(idx+1).trim();
        kv[k] = v;
      }
      return kv;
    }

    let parsedCount = 0;
    // ensure session parsedCookies exists
    sess.parsedCookies = sess.parsedCookies || [];

    // We'll validate sequentially to avoid overloading the host.
    for (let i=0;i<lines.length;i++) {
      const l = lines[i];
      const kv = parseLineToKv(l);
      const hasCUser = !!kv['c_user'];
      const hasXs = !!kv['xs'];
      const expires = kv['expires'] || kv['Expires'] || kv['Max-Age'] || kv['max-age'] || null;
      const isAccount = hasCUser && hasXs;

      const summary = {
        lineIndex: i+1,
        snippet: l.length > 160 ? l.slice(0,160)+'...' : l,
        hasCUser,
        hasXs,
        expires: expires || null,
        isAccount
      };

      // prepare record and push into session store
      const record = {
        lineIndex: summary.lineIndex,
        snippet: summary.snippet,
        hasCUser: summary.hasCUser,
        hasXs: summary.hasXs,
        expires: summary.expires,
        isAccount: summary.isAccount,
        parsedAt: new Date().toISOString(),
        validateResult: null
      };
      sess.parsedCookies.push(record);

      if (!isAccount) {
        sseSend(sessionId, 'cookieStatus', { status: 'invalid', reason: 'missing c_user/xs', ...record });
        // don't attempt validation; continue
        continue;
      }

      parsedCount++;
      sseSend(sessionId, 'cookieStatus', { status: 'parsed', ...record });

      // create puppeteer-style cookie objects for setCookie
      const cookieObjects = [];
      for (const [k,v] of Object.entries(kv)) {
        if (k && v !== undefined) {
          cookieObjects.push({
            name: k,
            value: v,
            domain: '.facebook.com',
            path: '/',
            httpOnly: false,
            secure: true
          });
        }
      }

      // run quick validation for this account (sequential)
      sseSend(sessionId, 'log', { msg: `Validating account line ${i+1}` });
      const result = await quickValidateCookie(cookieObjects, sessionId);

      // attach result to record in session store
      record.validateResult = { status: result.status, reason: result.reason || null, url: result.url || null };

      if (result.status === 'live') {
        sseSend(sessionId, 'cookieStatus', { status: 'live', lineIndex:record.lineIndex, reason: result.reason, url: result.url || null });
      } else if (result.status === 'invalid') {
        sseSend(sessionId, 'cookieStatus', { status: 'invalid', lineIndex:record.lineIndex, reason: result.reason, url: result.url || null });
      } else {
        sseSend(sessionId, 'cookieStatus', { status: 'error', lineIndex:record.lineIndex, reason: result.reason });
      }

      // small gap to be polite
      await new Promise(r => setTimeout(r, 600 + Math.floor(Math.random()*400)));
    }

    sseSend(sessionId, 'log', { msg:`Parsed ${parsedCount} account cookie(s)` });
    return res.json({ ok:true, parsed: parsedCount, totalLines: lines.length });
  } catch (e) {
    simpleLog('uploadCookies-error', e && e.message);
    sseSend(sessionId, 'error', { msg: 'upload handler error', error: e && e.message });
    return res.status(500).json({ ok:false, error: e && e.message ? e.message : String(e) });
  }
});

// start
app.post('/start', requireAdmin, (req, res) => {
  const body = req.body || {};
  const sessionId = body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (sess.running) return res.status(409).json({ ok:false, message:'Job already running' });
  if (!body.targetUrl && !body.target) return res.status(400).json({ ok:false, message:'targetUrl required' });

  (async () => {
    try { await reportRunner(sessionId, body); } catch(e) { sseSend(sessionId,'fatal',{msg:e && e.message? e.message:String(e)}); }
  })();

  res.json({ ok:true, message:'Job started', sessionId });
});

// stop
app.post('/stop', requireAdmin, async (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  const sess = getSession(sessionId);
  if (!sess.running) return res.json({ ok:false, message:'No active job' });
  sess.abort = true;
  sseSend(sessionId,'info',{msg:'Stop requested by user'});
  try {
    for (const p of sess.pages) { try { await p.close(); } catch(e) {} }
    sess.pages = [];
    if (sess.browser) { try { await sess.browser.close(); } catch(e) {} sess.browser = null; }
  } catch (e) { simpleLog('stop-cleanup-error', e && e.message); }
  return res.json({ ok:true, message:'Stop requested and cleanup attempted' });
});

// clearLogs
app.post('/clearLogs', requireAdmin, (req,res) => {
  const sid = req.body.sessionId || 'default';
  const sess = getSession(sid);
  sess.logs = [];
  res.json({ ok:true });
});

// status
app.get('/status', requireAdmin, (req,res) => {
  const sessionId = req.query.sessionId || 'default';
  const sess = getSession(sessionId);
  res.json({ running: sess.running, abort: sess.abort, logs: sess.logs.slice(-200) });
});

// exampleCookies
app.get('/exampleCookies', (req,res) => {
  res.type('text/plain').send('fr=...; xs=...; c_user=1000...; datr=...; sb=...; wd=390x844;');
});

// basic report endpoint
app.post('/report', requireAdmin, express.json({ limit:'2mb' }), (req,res) => {
  const { type, target, options, cookies } = req.body;
  if (!type || !target) return res.status(400).json({ ok:false, message:'type and target required' });
  simpleLog('New job received', { type, target, optionsSample: Array.isArray(options) ? options.slice(0,5) : options });
  res.json({ ok:true, message:'Job accepted' });
});

// error handler
app.use((err, req, res, next) => {
  console.error('Uncaught server error:', err);
  simpleLog('uncaught-server-error', err && err.message ? err.message : String(err));
  try { res.status(500).json({ ok:false, message: err.message || 'Server error' }); } catch(e) {}
});

// unhandled handlers
process.on('unhandledRejection', (reason) => { console.error('Unhandled Rejection:', reason); simpleLog('unhandledRejection', String(reason)); });
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); simpleLog('uncaughtException', err && err.stack || String(err)); setTimeout(()=>process.exit(1),5000); });

// graceful
async function gracefulShutdown() {
  simpleLog('Graceful shutdown initiated');
  for (const [sid, sess] of sessions.entries()) {
    try {
      sess.abort = true;
      for (const p of sess.pages) { try { await p.close(); } catch(e) {} }
      if (sess.browser) { try { await sess.browser.close(); } catch(e) {} }
    } catch (e) {}
  }
  process.exit(0);
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// start listener
app.listen(PORT, () => {
  simpleLog(`🚀 Server listening on port ${PORT}`);
});
