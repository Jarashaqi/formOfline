// Script sederhana untuk generate icon PWA dari SVG
// Memerlukan: npm install sharp (atau gunakan online converter)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('⚠️  Script ini memerlukan library sharp untuk generate icon PNG dari SVG.');
console.log('📝 Instruksi manual:');
console.log('   1. Buka file public/icon.svg di browser atau editor');
console.log('   2. Export sebagai PNG dengan ukuran 192x192 dan 512x512');
console.log('   3. Simpan sebagai pwa-192x192.png dan pwa-512x512.png di folder public/');
console.log('');
console.log('🌐 Atau gunakan online converter:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('');
console.log('💡 Alternatif: Install sharp dan jalankan script ini:');
console.log('   npm install sharp');
console.log('   node scripts/generate-icons.js');

// Jika sharp tersedia, generate icon
try {
  const sharp = await import('sharp');
  const svgPath = path.join(__dirname, '../public/icon.svg');
  const outputDir = path.join(__dirname, '../public');
  
  if (!fs.existsSync(svgPath)) {
    console.error('❌ File icon.svg tidak ditemukan di public/');
    process.exit(1);
  }
  
  console.log('🔄 Generating icons...');
  
  // Generate 192x192
  await sharp.default(svgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'pwa-192x192.png'));
  console.log('✅ Generated pwa-192x192.png');
  
  // Generate 512x512
  await sharp.default(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'pwa-512x512.png'));
  console.log('✅ Generated pwa-512x512.png');
  
  console.log('🎉 Icon generation selesai!');
} catch (err) {
  if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message.includes('sharp')) {
    // sharp tidak terinstall, tampilkan instruksi
    console.log('');
  } else {
    console.error('❌ Error:', err.message);
  }
}

