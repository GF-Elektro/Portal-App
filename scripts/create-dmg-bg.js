const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 760,
    show: false,
    frame: false,
    transparent: false,
    webPreferences: { offscreen: true }
  });
  
  // Premium light installer background — inspired by Apple, Stripe, Linear
  // Light enough for macOS's black icon labels to be perfectly readable
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            width: 1200px;
            height: 760px;
            background: linear-gradient(180deg, #fafafa 0%, #f2f2f4 50%, #eaeaec 100%);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow: hidden;
            position: relative;
          }
          
          /* Premium red accent bar at top — brand identity */
          .accent-bar {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 5px;
            background: linear-gradient(90deg, #b71c1c, #d32f2f 30%, #e53935 50%, #d32f2f 70%, #b71c1c);
          }
          
          /* Very subtle geometric pattern */
          .pattern {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0);
            background-size: 40px 40px;
            pointer-events: none;
          }
          
          /* Subtle light glow in center where icons will be */
          .center-glow {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 700px;
            height: 400px;
            background: radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%);
            pointer-events: none;
          }
          
          /* Elegant thin arrow in exact center between the two icon positions */
          .arrow-zone {
            position: absolute;
            top: 46%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            gap: 6px;
            opacity: 0.25;
          }
          .arrow-line {
            width: 80px;
            height: 1.5px;
            background: linear-gradient(90deg, transparent, #333, #333);
          }
          .arrow-head {
            width: 0;
            height: 0;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
            border-left: 9px solid #333;
          }
          
          /* Bottom branding — very subtle */
          .brand {
            position: absolute;
            bottom: 28px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 18px;
            font-weight: 300;
            color: rgba(0, 0, 0, 0.12);
            letter-spacing: 6px;
            text-transform: uppercase;
          }
          
          /* Subtle corner accent marks — premium framing */
          .corner {
            position: absolute;
            width: 24px;
            height: 24px;
            border-color: rgba(211, 47, 47, 0.15);
            border-style: solid;
          }
          .corner.tl { top: 24px; left: 24px; border-width: 1.5px 0 0 1.5px; }
          .corner.tr { top: 24px; right: 24px; border-width: 1.5px 1.5px 0 0; }
          .corner.bl { bottom: 24px; left: 24px; border-width: 0 0 1.5px 1.5px; }
          .corner.br { bottom: 24px; right: 24px; border-width: 0 1.5px 1.5px 0; }
          
          /* Thin separator line near bottom */
          .separator {
            position: absolute;
            bottom: 70px;
            left: 60px;
            right: 60px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent);
          }
        </style>
      </head>
      <body>
        <div class="accent-bar"></div>
        <div class="pattern"></div>
        <div class="center-glow"></div>
        
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        
        <div class="arrow-zone">
          <div class="arrow-line"></div>
          <div class="arrow-head"></div>
        </div>
        
        <div class="separator"></div>
        <div class="brand">G&amp;F Elektro Portal</div>
      </body>
    </html>
  `;
  
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
  await new Promise(r => setTimeout(r, 2000));
  
  const image = await win.webContents.capturePage();
  const outDir = path.join(__dirname, '../build');
  
  fs.writeFileSync(path.join(outDir, 'dmg-background@2x.png'), image.toPNG());
  console.log('Generated premium light DMG background @2x');
  app.quit();
});
