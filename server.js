// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');

const { runFlowOnTarget, sleep } = require('./flow-runner');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

let jobs = new Map(); // jobId -> { running, abort, logs:[], clients:Set }

function getJob(jobId){
  if(!jobs.has(jobId)) jobs.set(jobId, { running:false, abort:false, logs:[], clients: new Set() });
  return jobs.get(jobId);
}

function pushLog(jobId, type, text, meta={}){
  const j = getJob(jobId);
  const entry = { ts: Date.now(), type, text, meta };
  j.logs.push(entry);
  if (j.logs.length > 1000) j.logs.shift();
  for (const res of j.clients) {
    try { res.write(`data: ${JSON.stringify(entry)}\n\n`); } catch(e){ j.clients.delete(res); }
  }
  console.log(`[job ${jobId}] ${type}: ${text}`);
}

// SSE
app.get('/events/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  if (!jobId) return res.status(400).end();
  const j = getJob(jobId);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.write('\n');
  j.clients.add(res);
  // send history last 100
  const last = j.logs.slice(-100);
  for (const e of last) res.write(`data: ${JSON.stringify(e)}\n\n`);
  req.on('close', () => { j.clients.delete(res); });
});

// load flows
const FLOWS_PATH = path.join(__dirname, 'flows.json');
function loadFlows(){
  if (!fs.existsSync(FLOWS_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(FLOWS_PATH, 'utf8')).flows || {}; } catch(e){ return {}; }
}

// Start job
app.post('/start', upload.array('cookies'), async (req, res) => {
  try {
    const body = req.body || {};
    const flowId = body.flowId;
    const targetUrl = body.targetUrl;
    if (!flowId || !targetUrl) return res.status(400).json({ ok:false, message:'flowId and targetUrl required' });

    const flows = loadFlows();
    const flow = flows[flowId];
    if (!flow) return res.status(400).json({ ok:false, message:'flow not found' });

    // uploaded cookie files
    const cookieFiles = (req.files || []).map(f=>path.join(UPLOAD_DIR, f.filename));
    if (!cookieFiles.length) pushLog('system', 'warn', 'No cookies uploaded. You can pass cookie files to run per-account.');

    const jobId = uuidv4();
    const job = getJob(jobId);
    job.running = true;
    job.abort = false;

    res.json({ ok:true, jobId });

    // launch browser
    let browser;
    try {
      pushLog(jobId, 'info', 'Launching browser');
      browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    } catch(e) {
      pushLog(jobId, 'error', 'Browser launch failed: ' + (e.message||e));
      job.running = false;
      return;
    }

    // process cookie files sequentially with backoff
    for (const cf of cookieFiles) {
      if (job.abort) break;
      pushLog(jobId, 'info', `Processing cookie file: ${path.basename(cf)}`);
      let cookieObj = null;
      try {
        const raw = fs.readFileSync(cf, 'utf8');
        cookieObj = JSON.parse(raw);
      } catch(e){
        pushLog(jobId, 'warn', `Invalid cookie JSON: ${cf}`);
        continue;
      }

      try {
        const result = await runFlowOnTarget(browser, flow, targetUrl, cookieObj, {
          logger: (m)=>pushLog(jobId,'log',m),
          timeoutMs: 25000
        });
        pushLog(jobId, 'info', `Flow run result for ${path.basename(cf)}: ${result?.ok ? 'ok' : 'fail'}`);
      } catch(e){
        pushLog(jobId, 'error', `Flow error for ${path.basename(cf)}: ${e.message||e}`);
      }

      // small delay between accounts
      await sleep(5000 + Math.floor(Math.random()*3000));
    }

    // close browser
    try { await browser.close(); } catch(e){ pushLog(jobId,'warn','browser close failed'); }
    job.running = false;
    pushLog(jobId, 'info', 'Job finished');
  } catch(e){
    console.error('start error', e);
  }
});

// Stop
app.post('/stop', (req, res) => {
  const jobId = req.body.jobId;
  if (!jobId) return res.status(400).json({ ok:false, message:'jobId required' });
  const j = getJob(jobId);
  if (!j.running) return res.json({ ok:false, message:'not running' });
  j.abort = true;
  pushLog(jobId, 'warn', 'Stop requested');
  res.json({ ok:true });
});

// list flows
app.get('/flows', (req, res) => {
  const flows = loadFlows();
  res.json({ ok:true, flows });
});

// static serve uploads for testing (optional)
app.use('/uploads', express.static(UPLOAD_DIR));

// Global error handlers
app.use((err, req, res, next) => {
  console.error('Uncaught error', err);
  res.status(500).json({ ok:false, message: err.message || 'server error' });
});

process.on('unhandledRejection', (r) => { console.error('unhandledRejection', r); });
process.on('uncaughtException', (err) => { console.error('uncaughtException', err); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));
