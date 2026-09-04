const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'logo.png');
const destDir = path.join(__dirname, 'public');
const dest = path.join(destDir, 'logo.png');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('✅ Logo copied to public/logo.png');
} else if (fs.existsSync(dest)) {
  console.log('✅ Logo already at public/logo.png');
} else {
  console.log('❌ logo.png not found in root or public/');
}
