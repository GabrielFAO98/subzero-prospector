const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'icons');
const sizes = [256, 128, 64, 48, 32, 16];

function createIco(pngFiles, outputPath) {
  const count = pngFiles.length;
  const headerSize = 6;
  const entrySize = 16;
  let currentOffset = headerSize + count * entrySize;

  // Header: 6 bytes
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // idReserved
  header.writeUInt16LE(1, 2); // idType (1 = icon)
  header.writeUInt16LE(count, 4); // idCount

  const entries = [];
  const buffers = [];

  for (const file of pngFiles) {
    const data = fs.readFileSync(file.path);
    const entry = Buffer.alloc(entrySize);

    const width = file.size === 256 ? 0 : file.size;
    const height = file.size === 256 ? 0 : file.size;

    entry.writeUInt8(width, 0); // bWidth
    entry.writeUInt8(height, 1); // bHeight
    entry.writeUInt8(0, 2); // bColorCount (0 for truecolor)
    entry.writeUInt8(0, 3); // bReserved
    entry.writeUInt16LE(1, 4); // wPlanes
    entry.writeUInt16LE(32, 6); // wBitCount (32 bpp)
    entry.writeUInt32LE(data.length, 8); // dwBytesInRes
    entry.writeUInt32LE(currentOffset, 12); // dwImageOffset

    entries.push(entry);
    buffers.push(data);

    currentOffset += data.length;
  }

  const finalBuffer = Buffer.concat([header, ...entries, ...buffers]);
  fs.writeFileSync(outputPath, finalBuffer);
  console.log(`ICO criado com sucesso em: ${outputPath} (${finalBuffer.length} bytes)`);
}

const fileList = sizes.map(s => ({
  size: s,
  path: path.join(iconsDir, `icon_${s}.png`)
}));

createIco(fileList, path.join(iconsDir, 'app.ico'));
createIco(fileList, path.join(__dirname, '..', 'app.ico'));
