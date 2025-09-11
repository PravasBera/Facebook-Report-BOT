// flow-runner.js
const fs = require('fs');
const path = require('path');

const DEFAULT_RETRY = 3;
const DEFAULT_WAIT_MS = 500;

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function clickSelectorWithRetries(page, selector, attempts = DEFAULT_RETRY, between = 600) {
  for (let i=0;i<attempts;i++){
    try {
      if (selector.startsWith('xpath:')) {
        const xp = selector.slice(6);
        const els = await page.$x(xp);
        if (els.length) { await els[0].click(); return true; }
      } else {
        const el = await page.$(selector);
        if (el) { await el.click(); return true; }
      }
    } catch (e) {
      // ignore
    }
    await sleep(between);
  }
  return false;
}

async function clickTextWithRetries(page, texts, attempts = DEFAULT_RETRY) {
  const lowered = texts.map(t => String(t).toLowerCase());
  for (let i=0;i<attempts;i++){
    try {
      for (const t of lowered) {
        // XPath case-insensitive contains on text
        const xp = `//*[contains(translate(normalize-space(string(.)), "ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"), "${t}")]`;
        const els = await page.$x(xp);
        if (els.length) {
          try { await els[0].evaluate(e => e.click()); } catch(e){ await els[0].click(); }
          return true;
        }
      }
    } catch(e){}
    await sleep(400 + i*200);
  }
  return false;
}

async function doStep(page, step) {
  if (!step || !step.type) return false;
  if (step.type === 'wait') { await sleep(step.ms || DEFAULT_WAIT_MS); return true; }
  if (step.type === 'click_selector') {
    return await clickSelectorWithRetries(page, step.value, step.attempts || DEFAULT_RETRY, step.between || 600);
  }
  if (step.type === 'click_text') {
    const arr = Array.isArray(step.value) ? step.value : [step.value];
    return await clickTextWithRetries(page, arr, step.attempts || DEFAULT_RETRY);
  }
  if (step.type === 'screenshot') {
    await page.screenshot({ path: step.path || 'screenshot.png', fullPage: !!step.fullPage });
    return true;
  }
  return false;
}

async function runFlowOnTarget(browser, flow, targetUrl, cookieObj=null, opts={logger:console.log, timeoutMs:30000}) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 412, height: 915 });
  } catch(e){}

  if (cookieObj && Array.isArray(cookieObj) && cookieObj.length){
    try{
      await page.setCookie(...cookieObj);
      opts.logger?.(`➡ Cookies set`);
    }catch(e){ opts.logger?.(`⚠ cookie set failed: ${e.message || e}`); }
  }

  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs || 30000 });
  } catch(e){
    opts.logger?.(`⚠ goto failed: ${e.message || e}`);
  }

  for (const step of (flow.steps || [])) {
    try {
      const ok = await doStep(page, step);
      opts.logger?.(`step ${step.type} -> ${ok ? 'OK' : 'FAILED'}${step.value ? ` (${JSON.stringify(step.value).slice(0,100)})` : ''}`);
      // if step failed, continue trying next steps (we don't crash)
    } catch (e) {
      opts.logger?.(`step error: ${e.message || e}`);
    }
    await sleep(step?.postWait || 250);
  }

  // save cookies back to return if needed
  let savedCookies = null;
  try {
    savedCookies = await page.cookies();
  } catch(e){}

  try { await page.close(); } catch(e){}

  return { ok: true, cookies: savedCookies };
}

module.exports = { runFlowOnTarget, sleep };
