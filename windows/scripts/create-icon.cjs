const fs = require('fs');
const path = require('path');

const srcLogo = path.resolve(__dirname, '../../web/assets/logo.png');
const destPng = path.resolve(__dirname, '../assets/icon.png');
const destIco = path.resolve(__dirname, '../assets/icon.ico');
const destSplash = path.resolve(__dirname, '../assets/splash.png');

if (!fs.existsSync(srcLogo)) {
  console.error('Source logo not found at:', srcLogo);
  process.exit(1);
}

const pngBuffer = fs.readFileSync(srcLogo);
fs.writeFileSync(destPng, pngBuffer);
fs.writeFileSync(destSplash, pngBuffer);

// Construct ICO container with the 256x256 PNG
// ICONDIR header (6 bytes):
// 2 bytes reserved (0)
// 2 bytes type (1 = icon)
// 2 bytes image count (1)
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);
iconDir.writeUInt16LE(1, 2);
iconDir.writeUInt16LE(1, 4);

// ICONDIRENTRY (16 bytes)
const iconEntry = Buffer.alloc(16);
iconEntry.writeUInt8(0, 0); // 0 means 256px width
iconEntry.writeUInt8(0, 1); // 0 means 256px height
iconEntry.writeUInt8(0, 2); // color count
iconEntry.writeUInt8(0, 3); // reserved
iconEntry.writeUInt16LE(1, 4); // color planes
iconEntry.writeUInt16LE(32, 6); // bits per pixel
iconEntry.writeUInt32LE(pngBuffer.length, 8); // image size
iconEntry.writeUInt32LE(6 + 16, 12); // image offset (header + 1 entry)

const icoBuffer = Buffer.concat([iconDir, iconEntry, pngBuffer]);
fs.writeFileSync(destIco, icoBuffer);

console.log('Successfully generated icon.png, splash.png, and icon.ico in assets/');
