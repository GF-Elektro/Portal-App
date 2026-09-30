#!/usr/bin/env node
/**
 * Regenerate PortalEU + Flutter mobile app icons from icon-512.png (repo root).
 * Invoked by scripts/sync-app-icons.sh
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'icon-512.png');

const PORTALEU_ASSETS = path.join(ROOT, 'ios', 'PortalEU', 'Assets.xcassets');
const PORTALEU_APPICON = path.join(PORTALEU_ASSETS, 'AppIcon.appiconset');
const FLUTTER_IOS_APPICON = path.join(
  ROOT,
  'mobile',
  'portal_android',
  'ios',
  'Runner',
  'Assets.xcassets',
  'AppIcon.appiconset'
);
const FLUTTER_ANDROID_RES = path.join(
  ROOT,
  'mobile',
  'portal_android',
  'android',
  'app',
  'src',
  'main',
  'res'
);

const ANDROID_LAUNCHER_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

function parseIconPixelSize(sizeStr, scaleStr) {
  const [w] = sizeStr.split('x').map(parseFloat);
  const scale = parseInt(String(scaleStr).replace(/x$/i, ''), 10);
  return Math.round(w * scale);
}

async function resizePng(destPath, px, flattenWhite = false) {
  let pipeline = sharp(SOURCE).resize(px, px, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: flattenWhite ? 1 : 0 },
    kernel: sharp.kernel.lanczos3,
  });
  if (flattenWhite) {
    pipeline = pipeline.flatten({ background: '#ffffff' });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(destPath);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function syncPortalEu() {
  writeJson(path.join(PORTALEU_ASSETS, 'Contents.json'), {
    info: { author: 'xcode', version: 1 },
  });
  writeJson(path.join(PORTALEU_APPICON, 'Contents.json'), {
    images: [
      {
        filename: 'AppIcon-1024.png',
        idiom: 'universal',
        platform: 'ios',
        size: '1024x1024',
      },
    ],
    info: { author: 'xcode', version: 1 },
  });
  await resizePng(path.join(PORTALEU_APPICON, 'AppIcon-1024.png'), 1024, true);
  console.log('PortalEU AppIcon (1024, opaque)');
}

async function syncFlutterIos() {
  const contentsPath = path.join(FLUTTER_IOS_APPICON, 'Contents.json');
  const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
  for (const img of contents.images) {
    if (!img.filename) continue;
    const px = parseIconPixelSize(img.size, img.scale);
    const flatten = img.idiom === 'ios-marketing';
    const dest = path.join(FLUTTER_IOS_APPICON, img.filename);
    await resizePng(dest, px, flatten);
    console.log(`Flutter iOS ${img.filename} (${px}px${flatten ? ', opaque' : ''})`);
  }
}

async function syncFlutterAndroid() {
  for (const [folder, px] of Object.entries(ANDROID_LAUNCHER_SIZES)) {
    const dest = path.join(FLUTTER_ANDROID_RES, folder, 'ic_launcher.png');
    await resizePng(dest, px, false);
    console.log(`Flutter Android ${folder}/ic_launcher.png (${px}px)`);
  }
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Missing source icon: ${SOURCE}`);
    process.exit(1);
  }
  await syncPortalEu();
  await syncFlutterIos();
  await syncFlutterAndroid();
  console.log('\nDone. Rebuild PortalEU or Flutter to see updated icons.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
