/* ============================================
   CONVERT VIDEO TO 9:16
   AESTHETIC MIRROR BACKGROUND
   - Video di tengah (auto-center)
   - Background = mirror video (flip vertical)
   - Blur ringan (aesthetic, bukan blur tebal)
   - Brightness terang (bukan gelap)
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
  console.log('CONVERT TO 9:16 - AESTHETIC MODE');
  console.log('='.repeat(60));

  const config = {
    blurStrength: parseFloat(process.env.BLUR_STRENGTH || '15'),
    brightness: parseFloat(process.env.BRIGHTNESS || '0.7'),
    saturation: parseFloat(process.env.SATURATION || '0.85'),
    videoScale: parseFloat(process.env.VIDEO_SCALE || '0.75'),
    targetWidth: 1080,
    targetHeight: 1920,
  };

  console.log('Config:');
  console.log('  Target: ' + config.targetWidth + 'x' + config.targetHeight);
  console.log('  Blur: ' + config.blurStrength + ' (ringan)');
  console.log('  Brightness: ' + config.brightness + ' (terang)');
  console.log('  Saturation: ' + config.saturation);
  console.log('  Video Scale: ' + (config.videoScale * 100) + '%');

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
  // FILTER AESTHETIC
  // ============================================
  //
  // Cara kerja:
  // 1. Split video jadi 2 (bg + fg)
  // 2. Background: scale COVER + blur RINGAN + flip vertical (mirror)
  // 3. Foreground: scale FIT (video asli)
  // 4. Overlay fg di tengah, bg di belakang
  //
  // Filter FFmpeg rules:
  // • Koma (,) = chain filter (sequential)
  // • Semicolon (;) = split chain (parallel)
  //
  const bgChain = '[bg]' +
    'scale=' + config.targetWidth + ':' + config.targetHeight + ':force_original_aspect_ratio=increase' +
    ',crop=' + config.targetWidth + ':' + config.targetHeight +
    ',vflip' +                                              // mirror vertical (opsional)
    ',gblur=sigma=' + config.blurStrength +                 // blur RINGAN
    ',eq=brightness=' + (config.brightness - 1).toFixed(2) + ':saturation=' + config.saturation +
    '[bgblur]';

  const fgChain = '[fg]' +
    'scale=' + config.targetWidth + ':' + videoAreaHeight + ':force_original_aspect_ratio=decrease' +
    '[fgscaled]';

  const overlay = '[bgblur][fgscaled]overlay=(W-w)/2:(H-h)/2[out]';

  const filter = [
    '[0:v]split=2[bg][fg]',
    bgChain,
    fgChain,
    overlay,
  ].join(';');

  console.log('');
  console.log('Filter (aesthetic mirror):');
  console.log(filter);
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
  console.log('CONVERT COMPLETE - AESTHETIC MODE');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});