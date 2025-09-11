// runner.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { profileFlows, pageFlows, postFlows } = require('./flows');

const COOKIES_DIR = path.join(__dirname, 'cookies');
if (!fs.existsSync(COOKIES_DIR)) fs.mkdirSync(COOKIES_DIR, { recursive: true });

async function loadCookies(page, cookiePath){
  try{
    if (!cookiePath || !fs.existsSync(cookiePath)) return false;
    const raw = fs.readFileSync(cookiePath, 'utf-8');
    const cookies = JSON.parse(raw);
    if (!Array.isArray(cookies)) return false;
    await page.setCookie(...cookies);
    return true;
  }catch(e){
    console.error("loadCookies error:", e.message);
    return false;
  }
}

async function runFlowOnPage({ targetUrl, flow, cookiePath, headless=true }){
  const browser = await puppeteer.launch({ headless, args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try{
    if (cookiePath) await loadCookies(page, cookiePath);
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1500);

    for (const step of flow.steps){
      try{
        if (step.action === 'wait'){
          if (step.selector.startsWith('xpath:')){
            const xp = step.selector.slice(6);
            await page.waitForXPath(xp, { timeout: 10000 }).catch(()=>{ /* ignore */ });
          } else {
            await page.waitForSelector(step.selector, { timeout: 10000 }).catch(()=>{ /* ignore */ });
          }
        } else if (step.action === 'click'){
          if (step.selector.startsWith('xpath:')){
            const xp = step.selector.slice(6);
            const els = await page.$x(xp);
            if (els.length) {
              await els[0].click();
            } else {
              throw new Error('selector not found (xpath) -> ' + xp);
            }
          } else {
            const el = await page.$(step.selector);
            if (el) await el.click();
            else throw new Error('selector not found (css) -> ' + step.selector);
          }
          await page.waitForTimeout(900 + Math.floor(Math.random()*800)); // small jitter
        } else if (step.action === 'maybeClick'){
          try{
            if (step.selector.startsWith('xpath:')){
              const xp = step.selector.slice(6);
              const els = await page.$x(xp);
              if (els.length) await els[0].click();
            } else {
              const el = await page.$(step.selector);
              if (el) await el.click();
            }
            await page.waitForTimeout(800);
          }catch(e){ /* ignore optional clicks */ }
        } else {
          // unknown action
        }
      }catch(errStep){
        // If a critical step failed, log and continue (we don't kill)
        console.error(`Step failed: ${step.selector} -> ${errStep.message}`);
      }
    }

    // final wait and screenshot for debug
    await page.waitForTimeout(1200);
    const debugFile = path.join(__dirname, 'debug', `screenshot-${Date.now()}.png`);
    try { fs.mkdirSync(path.dirname(debugFile), { recursive:true }); await page.screenshot({ path: debugFile, fullPage:true }); } catch(e){}
    await browser.close();
    return { ok:true };
  }catch(e){
    console.error("runFlowOnPage error:", e);
    try{ await browser.close(); }catch(e){}
    return { ok:false, error: e.message };
  }
}

async function main(){
  // read environment args or CLI
  const argv = require('minimist')(process.argv.slice(2), { string:['type','target','set','cookies','headless'] });
  const type = argv.type || 'profile';
  const target = argv.target || argv.targetUrl || argv.t;
  const setIndex = parseInt(argv.set || argv.setIndex || '1', 10) || 1;
  const cookieFile = argv.cookies || argv.cookieFile || null;
  const headless = (argv.headless === 'false') ? false : true;

  if (!target) {
    console.error('Missing target URL. use --target="https://..."');
    process.exit(1);
  }

  let flow = null;
  if (type === 'profile') flow = profileFlows[setIndex-1];
  else if (type === 'page') flow = pageFlows[setIndex-1];
  else if (type === 'post') flow = postFlows[setIndex-1];
  if (!flow) {
    console.error('Flow not found for type=' + type + ' set=' + setIndex);
    process.exit(1);
  }

  console.log(`Running flow ${flow.name} on ${target} using cookie ${cookieFile}`);
  const res = await runFlowOnPage({ targetUrl: target, flow, cookiePath: cookieFile, headless });
  if (!res.ok) process.exit(2);
  console.log('Flow finished OK');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { runFlowOnPage };
