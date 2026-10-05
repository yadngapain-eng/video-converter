/* ============================================
   UNIVERSAL VIDEO DOWNLOADER
   --------------------------------------------
   Support:
     - Google Drive (direct link)
     - YouTube, YouTube Shorts
     - Facebook, Facebook Watch
     - Instagram (Post/Reels/IGTV)
     - TikTok
     - Twitter / X
     - Vimeo, Dailymotion, Reddit, Twitch, dll
     - 1000+ situs lain via yt-dlp
   ============================================ */

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

// ── Deteksi tipe URL ──
function detectSource(url) {
  const u = url.toLowerCase();
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) return 'gdrive';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('vimeo.com')) return 'vimeo';
  if (u.includes('dailymotion.com') || u.includes('dai.ly')) return 'dailymotion';
  if (u.includes('reddit.com')) return 'reddit';
  if (u.includes('twitch.tv')) return 'twitch';
  return 'generic';
}

// ── Google Drive direct download ──
function extractGDriveFileId(url) {
  const patterns = [
    /\/file\/d\/([^/]+)/,
    /[?&]id=([^&]+)/,
    /\/open\?id=([^&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function downloadGDrive(url, outFile) {
  const fileId = extractGDriveFileId(url);
  if (!fileId) throw new Error('Tidak bisa extract file ID dari Google Drive link');
  console.log(`   🆔 File ID: ${fileId}`);
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  execFileSync('curl', [
    '-L', '-o', outFile,
    '-H', 'User-Agent: Mozilla/5.0',
    directUrl
  ], { stdio: 'inherit' });
}

// ── yt-dlp universal download ──
function downloadWithYtDlp(url, outFile) {
  // Coba install yt-dlp kalau belum ada
  try {
    execSync('yt-dlp --version', { stdio: 'ignore' });
  } catch (e) {
    console.log('   📦 yt-dlp belum ada, install...');
    execSync('pip install -q -U yt-dlp', { stdio: 'inherit' });
  }

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    '--merge-output-format', 'mp4',
    '-o', outFile,
    '--force-overwrites',
    url,
  ];
  execFileSync('yt-dlp', args, { stdio: 'inherit' });
}

// ── Main ──
function main() {
  const link = process.env.GDRIVE_LINK || process.env.VIDEO_URL;
  if (!link) {
    console.error('❌ VIDEO_URL / GDRIVE_LINK tidak diset');
    process.exit(1);
  }

  console.log(`🔗 URL: ${link}`);
  const source = detectSource(link);
  console.log(`🎯 Terdeteksi: ${source}`);

  const outDir = 'input';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'video.mp4');

  try {
    if (source === 'gdrive') {
      console.log('📥 Mode: Google Drive direct');
      downloadGDrive(link, outFile);
    } else {
      console.log('📥 Mode: yt-dlp (universal)');
      downloadWithYtDlp(link, outFile);
    }

    if (!fs.existsSync(outFile)) {
      throw new Error('File output tidak ditemukan setelah download');
    }
    const size = fs.statSync(outFile).size;
    console.log(`✅ Download selesai: ${(size / 1024 / 1024).toFixed(2)} MB`);
  } catch (e) {
    console.error('❌ Download gagal:', e.message);
    process.exit(1);
  }
}

main();
