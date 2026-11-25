// Animated banner for the GitHub README: renders render.html?set=banner&anim=1 frame by frame
// in headless Chrome (every animation is paused and seeked, so frames are exact), then encodes a looping GIF.
// node store-screenshots/template/render-gif.mjs <out.gif> [width=1280] [fps=20] [loopMs=4800] [lang=en]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';

const [outArg = 'out/banner.gif', widthArg = '1280', fpsArg = '20', loopArg = '4800', lang = 'en'] = process.argv.slice(2);
const out = path.resolve(outArg);
const OUTW = +widthArg, FPS = +fpsArg, LOOP = +loopArg;
const W = 3840, H = 1280, scale = OUTW / W;
const frames = Math.round(LOOP / 1000 * FPS);
const DESIGN = new URL('./', import.meta.url).pathname;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gfe-banner-gif-'));

const port = 9401;
const prof = path.join(tmp, 'profile');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let k = 0; k < 40; k++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

try {
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `file://${DESIGN}render.html?set=banner&lang=${lang}&anim=1&loop=${LOOP}` });
  let ready = '';
  for (let k = 0; k < 160 && !ready; k++) { await sleep(150); ready = await evaluate(`document.body && document.body.dataset.ready === '1' ? (document.title || 'ok') : ''`); }
  if (!ready || String(ready).startsWith('IMGERR')) throw new Error('page not ready: ' + ready);
  console.log('animations:', await evaluate('window.__seek(0)'));
  for (let f = 0; f < frames; f++) {
    await evaluate(`window.__seek(${(f * LOOP / frames).toFixed(3)}); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale } });
    fs.writeFileSync(path.join(tmp, `f${String(f).padStart(4, '0')}.png`), Buffer.from(shot.data, 'base64'));
  }
} finally { ws.close(); chrome.kill(); await sleep(400); }

// Encode: one shared palette for all frames (no per-frame colour shimmer), light ordered dither, then frame-diff optimisation.
fs.mkdirSync(path.dirname(out), { recursive: true });
const list = fs.readdirSync(tmp).filter(f => f.endsWith('.png')).sort().map(f => path.join(tmp, f));
const delay = Math.round(100 / FPS);
execFileSync('magick', ['-delay', String(delay), '-loop', '0', ...list, '-coalesce', '-dither', process.env.DITHER || 'None', '-colors', process.env.COLORS || '160', '+remap', '-fuzz', process.env.FUZZ || '1.5%', '-layers', 'OptimizeTransparency', out], { stdio: 'inherit' });
fs.copyFileSync(list[0], out.replace(/\.gif$/, '-poster.png'));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${out}  ${frames} frames @ ${FPS} fps, ${(fs.statSync(out).size / 1048576).toFixed(2)} MB`);
