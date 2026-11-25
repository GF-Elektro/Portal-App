// node render.mjs <outDir> <langs comma> <sets comma>
// e.g. node store-screenshots/template/render.mjs store-screenshots/template/out en banner
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const [outDirArg, langsArg = 'en', setsArg = 'banner'] = process.argv.slice(2);
const outDir = path.resolve(outDirArg || new URL('./out/', import.meta.url).pathname);
const DESIGN = new URL('./', import.meta.url).pathname;
const SIZES = { play: [1080, 1920, 9], iphone: [1206, 2622, 9], ipad: [2752, 2064, 9], duo: [2853, 2007, 9], mac: [2880, 1800, 9], msstore: [1920, 1080, 9], header: [3840, 1646, 1], search: [3840, 2560, 1], poster: [1440, 2160, 1], banner: [3840, 1280, 1] };
const langs = langsArg.split(','), sets = setsArg.split(',');
const ORDER = ['home', 'reports', 'performance', 'turnus', 'growth', 'news', 'extra', 'docs', 'languages'];

const port = 9400;
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'gfe-store-render-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let k = 0; k < 40; k++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const pg = targets.find(t => t.type === 'page');
const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });

try {
  for (const set of sets) {
    const [W, H, N] = SIZES[set];
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    for (const lang of langs) {
      for (let i = 0; i < N; i++) {
        const url = `file://${DESIGN}render.html?set=${set}&lang=${lang}&i=${i}`;
        await send('Page.navigate', { url });
        let ready = false;
        for (let k = 0; k < 120 && !ready; k++) { await sleep(150); const r = await send('Runtime.evaluate', { expression: `document.body && document.body.dataset.ready === '1' ? document.title || 'ok' : ''`, returnByValue: true }); ready = r.result.value; }
        if (!ready || String(ready).startsWith('IMGERR')) console.log('WARN', set, lang, i, ready);
        const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
        const dir = path.join(outDir, lang, set); fs.mkdirSync(dir, { recursive: true });
        const name = N === 1 ? `${set}.png` : `${String(i + 1).padStart(2, '0')}-${ORDER[i]}.png`;
        fs.writeFileSync(path.join(dir, name), Buffer.from(shot.data, 'base64'));
      }
      console.log('done', set, lang);
    }
  }
} finally { ws.close(); chrome.kill(); await sleep(500); fs.rmSync(prof, { recursive: true, force: true }); }
