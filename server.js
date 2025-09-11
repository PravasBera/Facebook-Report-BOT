// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// multer for cookies upload
const upload = multer({ dest: path.join(__dirname, 'tmp') });

const jobs = {
  running: false,
  proc: null,
  clients: new Set()
};

// SSE endpoint
app.get('/events', (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  res.flushHeaders();
  jobs.clients.add(res);
  res.write('event: info\n');
  res.write('data: ' + JSON.stringify({ text: 'SSE connected' }) + '\n\n');
  req.on('close', () => {
    jobs.clients.delete(res);
  });
});

function sseSend(event, payload){
  for (const res of jobs.clients) {
    try {
      res.write(`event: ${event}\n`);
      res.write('data: ' + JSON.stringify(payload) + '\n\n');
    } catch (e) {
      jobs.clients.delete(res);
    }
  }
}

// Start-report endpoint
app.post('/start-report', upload.single('cookies'), async (req, res) => {
  try{
    if (jobs.running) return res.json({ ok:false, message:'Another job running' });

    const targetUrl = req.body.targetUrl;
    const type = req.body.type || 'profile';
    const setIndex = Number(req.body.setIndex || 1);

    if (!targetUrl) return res.status(400).json({ ok:false, message:'targetUrl required' });

    let cookiePath = null;
    if (req.file){
      const cookiesDir = path.join(__dirname, 'cookies');
      if (!fs.existsSync(cookiesDir)) fs.mkdirSync(cookiesDir, { recursive:true });
      const dest = path.join(cookiesDir, `cookies-${Date.now()}.json`);
      fs.renameSync(req.file.path, dest);
      cookiePath = dest;
    }

    // spawn worker
    const args = [
      'runner.js',
      `--type=${type}`,
      `--target=${targetUrl}`,
      `--set=${setIndex}`,
      cookiePath ? `--cookies=${cookiePath}` : '',
      `--headless=false`
    ].filter(Boolean);

    const nodeBin = process.execPath;
    const proc = spawn(nodeBin, args, { cwd: __dirname, stdio:['ignore','pipe','pipe'] });

    jobs.running = true;
    jobs.proc = proc;

    sseSend('info', { text: 'Job started', type, setIndex, targetUrl });

    proc.stdout.on('data', (chunk) => {
      const s = String(chunk);
      sseSend('log', { text: s });
    });
    proc.stderr.on('data', (chunk) => {
      const s = String(chunk);
      sseSend('error', { text: s });
    });

    proc.on('close', (code) => {
      sseSend('info', { text: `Worker exited code:${code}` });
      jobs.running = false;
      jobs.proc = null;
    });

    res.json({ ok:true, message:'Job started' });
  }catch(err){
    console.error('start-report error:', err);
    res.status(500).json({ ok:false, message: err.message });
  }
});

// stop endpoint
app.post('/stop-report', (req, res) => {
  try{
    if (!jobs.running || !jobs.proc) return res.json({ ok:false, message:'No job running' });
    try { jobs.proc.kill('SIGTERM'); } catch(e){}
    jobs.running = false;
    jobs.proc = null;
    sseSend('info', { text: 'Stop requested' });
    res.json({ ok:true });
  }catch(err){
    res.status(500).json({ ok:false, message: err.message });
  }
});

// health
app.get('/health', (_req,res) => res.json({ ok:true }));

// global error handlers
app.use((err, req, res, next) => {
  console.error('Uncaught Error:', err);
  try { res.status(500).json({ ok:false, message: err.message || 'Server error' }); } catch(e){}
});

process.on('unhandledRejection', (r) => {
  console.error('unhandledRejection', r);
});
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
});

app.listen(PORT, () => {
  console.log('Server listening on', PORT);
});
