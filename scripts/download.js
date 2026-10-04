/* ============================================
   DOWNLOAD VIDEO FROM GOOGLE DRIVE LINK
   Menggunakan NATIVE fs (tidak butuh fs-extra)
   ============================================ */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// ============================================
// EXTRACT FILE ID DARI LINK GDRIVE
// ============================================
function extractFileId(link) {
  if (!link) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ============================================
// ENSURE DIR (ganti fs-extra.ensureDir)
// ============================================
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================
// DOWNLOAD FILE
// ============================================
function downloadFile(url, dest, redirectCount) {
  redirectCount = redirectCount || 0;
  if (redirectCount > 10) {
    return Promise.reject(new Error('Too many redirects'));
  }

  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      // Handle redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); // consume response
        return downloadFile(res.headers.location, dest, redirectCount + 1)
          .then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }

      const file = fs.createWriteStream(dest);
      let downloaded = 0;
      const total = parseInt(res.headers['content-length'] || '0');
      let lastPrint = 0;

      res.on('data', (chunk) => {
        downloaded += chunk.length;
        const now = Date.now();
        if (now - lastPrint > 3000) {
          if (total > 0) {
            const pct = ((downloaded / total) * 100).toFixed(1);
            const mb = (downloaded / 1024 / 1024).toFixed(1);
            const totalMb = (total / 1024 / 1024).toFixed(1);
            console.log('   Progress: ' + pct + '% (' + mb + '/' + totalMb + ' MB)');
          } else {
            console.log('   Downloaded: ' + (downloaded / 1024 / 1024).toFixed(1) + ' MB');
          }
          lastPrint = now;
        }
      });

      res.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    });

    req.on('error', (err) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });

    req.setTimeout(300000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('='.repeat(60));
  console.log('DOWNLOAD FROM GOOGLE DRIVE');
  console.log('='.repeat(60));

  const link = process.env.GDRIVE_LINK;
  if (!link) {
    console.error('ERROR: GDRIVE_LINK tidak ada');
    process.exit(1);
  }

  console.log('Link: ' + link.substring(0, 80));

  const fileId = extractFileId(link);
  if (!fileId) {
    console.error('ERROR: tidak bisa extract file ID dari link');
    console.error('Format: https://drive.google.com/file/d/XXX/view');
    process.exit(1);
  }

  console.log('File ID: ' + fileId);

  ensureDir('input');

  const urls = [
    'https://drive.google.com/uc?export=download&id=' + fileId + '&confirm=t',
    'https://drive.google.com/uc?export=download&id=' + fileId,
    'https://drive.usercontent.google.com/download?id=' + fileId + '&export=download&confirm=t',
    'https://docs.google.com/uc?export=download&id=' + fileId,
  ];

  let downloaded = false;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const dest = 'input/video_' + i + '.tmp';

    try {
      console.log('');
      console.log('Try URL ' + (i+1) + '/' + urls.length + '...');

      await downloadFile(url, dest);

      const size = fs.statSync(dest).size;
      console.log('   Size: ' + (size / 1024 / 1024).toFixed(1) + ' MB');

      // Cek apakah HTML (login page)
      if (size < 50000) {
        const content = fs.readFileSync(dest, 'utf-8').substring(0, 1000);
        if (content.includes('<html') || content.includes('<!DOCTYPE')) {
          console.log('   WARNING: file HTML, skip');
          fs.unlinkSync(dest);
          continue;
        }
      }

      // Rename ke video.mp4
      const finalDest = 'input/video.mp4';
      if (fs.existsSync(finalDest)) fs.unlinkSync(finalDest);
      fs.renameSync(dest, finalDest);

      downloaded = true;
      break;
    } catch (e) {
      console.log('   Failed: ' + e.message);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
    }
  }

  if (!downloaded) {
    console.error('');
    console.error('ERROR: semua metode download gagal');
    console.error('');
    console.error('Kemungkinan: ');
    console.error('  1. File tidak public');
    console.error('  2. File > 100 MB (Google limit)');
    console.error('  3. Link tidak valid');
    process.exit(1);
  }

  // Verifikasi video
  console.log('');
  console.log('Verifikasi video...');
  try {
    const probe = execSync(
      'ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,codec_name -of default=noprint_wrappers=1 "input/video.mp4"',
      { encoding: 'utf-8' }
    );
    console.log(probe);
  } catch (e) {
    console.error('ERROR: bukan video valid');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('DOWNLOAD COMPLETE');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});