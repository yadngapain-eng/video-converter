const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function extractFileId(url) {
  const patterns = [
    /\/file\/d\/([^/]+)/,
    /[?&]id=([^&]+)/,
    /\/open\?id=([^&]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function main() {
  const link = process.env.GDRIVE_LINK;
  if (!link) { console.error('❌ GDRIVE_LINK tidak diset'); process.exit(1); }
  const fileId = extractFileId(link);
  if (!fileId) { console.error('❌ Tidak bisa extract file ID dari link'); process.exit(1); }
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const outDir = 'input';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'video.mp4');
  console.log(`📥 Downloading ${fileId} ...`);
  try {
    execFileSync('curl', ['-L', '-o', outFile, url], { stdio: 'inherit' });
    console.log('✅ Download selesai');
  } catch (e) {
    console.error('❌ Download gagal:', e.message);
    process.exit(1);
  }
}

main();
