// ─────────────────────────────────────────────────────────────
// Generate a multi-resolution ICO from the 512x512 PNG source
// Sizes: 16, 24, 32, 48, 64, 128, 256 – for crisp display at all DPI scales
// ─────────────────────────────────────────────────────────────
const sharp = require('sharp');
const { default: pngToIco } = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'icon-512.png');
const OUTPUT = path.join(__dirname, '..', 'build', 'icon.ico');
const TEMP_DIR = path.join(__dirname, '..', 'build', '.icon-tmp');
const SIZES = [16, 24, 32, 48, 64, 128, 256];

async function createMultiResIco() {
  // Ensure directories exist
  const buildDir = path.dirname(OUTPUT);
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  console.log(`📐 Generating ${SIZES.length} resolutions from ${path.basename(SOURCE)}...`);

  // Generate resized PNGs as temp files
  const tempFiles = [];
  for (const size of SIZES) {
    const tempPath = path.join(TEMP_DIR, `icon-${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(tempPath);
    
    const stat = fs.statSync(tempPath);
    console.log(`  ✅ ${size}x${size} (${stat.size} bytes)`);
    tempFiles.push(tempPath);
  }

  // Convert all PNGs into a single multi-resolution ICO
  const icoBuffer = await pngToIco(tempFiles);
  fs.writeFileSync(OUTPUT, icoBuffer);

  // Cleanup temp files
  for (const f of tempFiles) fs.unlinkSync(f);
  fs.rmdirSync(TEMP_DIR);

  const sizeKB = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`\n🎯 icon.ico created: ${sizeKB} KB (${SIZES.length} sizes)`);
  console.log(`   Path: ${OUTPUT}`);
}

createMultiResIco().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
