#!/usr/bin/env node
/**
 * Write docs/assets/desktop-version.json from package.json (docs site version label).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const out = path.join(ROOT, 'docs', 'assets', 'desktop-version.json');

if (!pkg.version || typeof pkg.version !== 'string') {
  console.error('package.json missing version string');
  process.exit(1);
}

fs.writeFileSync(out, JSON.stringify({ version: pkg.version }, null, 2) + '\n');
console.log('Wrote', out, '→', pkg.version);
