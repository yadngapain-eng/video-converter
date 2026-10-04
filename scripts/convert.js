/* ============================================
   CONVERT VIDEO TO 9:16 - CENTER MODE
   Filter: koma HANYA di antara filter, bukan di akhir
   ============================================ */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('CONVERT TO 9:16 - CENTER MODE');
  console.log('='.repeat(60));

  const config = {
    blurStrength: parseFloat(process.env.BLUR_STRENGTH || '30'),
    brightness: parseFloat(process.env.BRIGHTNESS || '0.5'),
    videoScale: parseFloat(process.env.VIDEO_SCALE || '0.75'),
    targetWidth: 1080,
    targetHeight: 1920,
  };

  console.log('Config:');
  console.log('  Target: ' + config.targetWidth + 'x' + config.targetHeight);
  console.log('  Blur: ' + config.blurStrength);
  console.log('  Brightness: ' + config.brightness);
  console.log('  Video Scale: ' + (config.videoScale * 100) + '% dari tinggi canvas');

  const files = fs.readdirSync('input');
  const videoFiles = files.filter(f => /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i.test(f));

  if (videoFiles.length === 0) {
    console.error('ERROR: tidak ada video di input/');
    process.exit(1);
  }

  const inputFile = path.join('input', videoFiles[0]);
  const baseName = path.parse(videoFiles[0]).name;

  console.log('Input: ' + inputFile);

  ensureDir('output');
  const outputFile = path.join('output', baseName + '_shorts.mp4');

  const videoAreaHeight = Math.floor(config.targetHeight * config.videoScale);
  console.log('Video area height: ' + videoAreaHeight + 'px');

  // ============================================
  // FILTER — Koma HANYA di ANTARA filter
  // ============================================
  //
  // Chain bg (sequential):
  //   [bg] → scale → crop → blur → eq → [bgblur]
  //   Ditulis: [bg]scale=...,crop=...,gblur=...,eq=...[bgblur]
  //
  // Perhatikan: KOMA di ANTARA filter, TIDAK di akhir
  //
  const bgChain = '[bg]' +
    'scale=' + config.targetWidth + ':' + config.targetHeight + ':force_original_aspect_ratio=increase' +
    ',crop=' + config.targetWidth + ':' + config.targetHeight +
    ',gblur=sigma=' + config.blurStrength +
    ',eq=brightness=-' + (1 - config.brightness).toFixed(2) + ':saturation=0.7' +
    '[bgblur]';

  const fgChain = '[fg]' +
    'scale=' + config.targetWidth + ':' + videoAreaHeight + ':force_original_aspect_ratio=decrease' +
    '[fgscaled]';

  const overlay = '[bgblur][fgscaled]overlay=(W-w)/2:(H-h)/2[out]';

  const filter = [
    '[0:v]split=2[bg][fg]',   // split pakai SEMICOLON
    bgChain,                  // chain bg: koma di antara filter
    fgChain,                  // 1 filter, no comma
    overlay,                  // overlay 2 input
  ].join(';');

  console.log('');
  console.log('Filter (auto-center):');
  console.log(filter);
  console.log('');
  console.log('overlay=(W-w)/2:(H-h)/2  ← video di tengah SEMPURNA');
  console.log('');

  const cmd = [
    'ffmpeg',
    '-i', '"' + inputFile + '"',
    '-filter_complex', '"' + filter + '"',
    '-map', '"[out]"',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', '"' + outputFile + '"',
  ].join(' ');

  console.log('Processing video...');

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('');
    console.log('Convert selesai!');
  } catch (err) {
    console.error('Convert gagal:', err.message);
    process.exit(1);
  }

  const stats = fs.statSync(outputFile);
  console.log('Output: ' + outputFile);
  console.log('Size: ' + (stats.size / 1024 / 1024).toFixed(1) + ' MB');

  fs.writeFileSync('output/info.txt', outputFile);

  console.log('='.repeat(60));
  console.log('CONVERT COMPLETE - VIDEO DI TENGAH');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});