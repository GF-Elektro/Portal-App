#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// G&F Elektro Portal – Custom DMG Builder
// Uses create-dmg for professional macOS installer creation
// ─────────────────────────────────────────────────────────────
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const APP_NAME = 'G&F Elektro Portal';
const VERSION = require(path.join(ROOT, 'package.json')).version;

// Step 1: Package the app with electron-forge
console.log('\n📦 Packaging application...');
execSync('npx electron-forge package', { cwd: ROOT, stdio: 'inherit' });

// Step 2: Find the packaged .app
const arch = process.arch; // arm64 or x64
const appDir = path.join(ROOT, 'out', `${APP_NAME}-darwin-${arch}`);
const appPath = path.join(appDir, `${APP_NAME}.app`);

if (!fs.existsSync(appPath)) {
  console.error(`❌ Could not find packaged app at: ${appPath}`);
  console.error('Available in out/:');
  if (fs.existsSync(path.join(ROOT, 'out'))) {
    fs.readdirSync(path.join(ROOT, 'out')).forEach(f => console.log(`  - ${f}`));
  }
  process.exit(1);
}

console.log(`✅ Found app: ${appPath}`);

// Step 3: Create DMG output directory
const outDir = path.join(ROOT, 'out', 'make');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Step 4: Remove old DMG if exists
const dmgName = `GFElektroPortal-${VERSION}.dmg`;
const dmgPath = path.join(outDir, dmgName);
if (fs.existsSync(dmgPath)) {
  fs.unlinkSync(dmgPath);
}

// Step 5: Build DMG using create-dmg
console.log('\n💿 Creating DMG installer...');
try {
  // create-dmg automatically:
  // - Creates a beautiful DMG with the app and Applications link
  // - Sets up proper icon positioning
  // - Handles Retina displays
  // - Sets the volume icon
  execSync(
    `npx create-dmg "${appPath}" "${outDir}" --overwrite`,
    { cwd: ROOT, stdio: 'inherit' }
  );
  
  // Rename the output DMG to our desired name
  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.dmg'));
  if (files.length > 0) {
    const generatedDmg = path.join(outDir, files[files.length - 1]);
    if (generatedDmg !== dmgPath) {
      fs.renameSync(generatedDmg, dmgPath);
    }
    console.log(`\n✅ DMG created successfully: ${dmgPath}`);
  }
} catch (err) {
  // create-dmg returns exit code 2 when it succeeds but couldn't sign
  // (which is expected without a dev certificate)
  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.dmg'));
  if (files.length > 0) {
    const generatedDmg = path.join(outDir, files[files.length - 1]);
    if (generatedDmg !== dmgPath && fs.existsSync(generatedDmg)) {
      fs.renameSync(generatedDmg, dmgPath);
    }
    console.log(`\n✅ DMG created: ${dmgPath}`);
    console.log('⚠️  Note: DMG is unsigned (code signing requires an Apple Developer certificate)');
  } else {
    console.error('❌ DMG creation failed');
    throw err;
  }
}
