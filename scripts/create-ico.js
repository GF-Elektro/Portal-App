const { default: pngToIco } = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'icon-512.png');
const outputPath = path.join(__dirname, '..', 'build', 'icon.ico');

// Ensure build directory exists
const buildDir = path.dirname(outputPath);
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

pngToIco(inputPath)
  .then(buf => {
    fs.writeFileSync(outputPath, buf);
    console.log('✅ icon.ico created successfully at', outputPath);
  })
  .catch(err => {
    console.error('❌ Error creating icon:', err);
    process.exit(1);
  });
