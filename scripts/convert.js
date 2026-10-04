/* ============================================
   CONVERT VIDEO TO 9:16 - STYLE PRESET
   Pilih style → semua parameter auto-set
   ============================================ */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getStyle, listStyles } = require('./styles.js');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('CONVERT TO 9:16 - STYLE PRESET MODE');
  console.log('='.repeat(60));

  // ============================================
  // BACA STYLE DARI ENV
  // ============================================
  const styleName = process.env.STYLE || 'clean-modern';
  const style = getStyle(styleName);

  console.log('');
  console.log('🎨 Style dipilih: ' + style.icon + ' ' + style.name);
  console.log('   ' + style.description);
  console.log('');
  console.log('📊 Parameter (auto-set):');
  console.log('   Blur: ' + style.blur);
  console.log('   Brightness: ' + style.brightness);
  console.log('   Saturation: ' + style.saturation);
  console.log('   Video Scale: ' + (style.videoScale * 100) + '%');
  console.log('   VFlip (mirror): ' + style.vflip);
  console.log('');

  // ============================================
  // LIST ALL STYLES (untuk referensi)
  // ============================================
  console.log('📋 Semua style yang tersedia:');
  listStyles();
  console.log('');

  const config = {
    blurStrength: style.blur,
    brightness: style.brightness,
    saturation: style.saturation,
    videoScale: style.videoScale,
    vflip: style.vflip,
    targetWidth: 1080,
    targetHeight: 1920,
  };

  const files = fs.readdirSync('input');
  const videoFiles = files.filter(f => /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i.test(f));

  if (videoFiles.length === 0) {
    console.error('ERROR: tidak ada video di input/');
    process.exit(1);
  }

  const inputFile = path.join('input', videoFiles[0]);
  const baseName = path.parse(videoFiles[0]).name;

  console.log('📁 Input: ' + inputFile);

  ensureDir('output');
  const outputFile = path.join('output', baseName + '_shorts.mp4');

  const videoAreaHeight = Math.floor(config.targetHeight * config.videoScale);

  // ============================================
  // BUILD FILTER
  // ============================================
  // Perhatikan aturan koma: koma HANYA di antara filter
  //
  var bgFilters = [
    'scale=' + config.targetWidth + ':' + config.targetHeight + ':force_original_aspect_ratio=increase',
    'crop=' + config.targetWidth + ':' + config.targetHeight,
  ];

  // VFlip kalau style support
  if (config.vflip) {
    bgFilters.push('vflip');
  }

  bgFilters.push('gblur=sigma=' + config.blurStrength);
  bgFilters.push('eq=brightness=' + (config.brightness - 1).toFixed(2) + ':saturation=' + config.saturation);

  const bgChain = '[bg]' + bgFilters.join(',') + '[bgblur]';

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
  console.log('🔧 Filter:');
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
  console.log('📁 Output: ' + outputFile);
  console.log('📊 Size: ' + (stats.size / 1024 / 1024).toFixed(1) + ' MB');

  fs.writeFileSync('output/info.txt', outputFile);
  fs.writeFileSync('output/style.txt', styleName);

  console.log('='.repeat(60));
  console.log('CONVERT COMPLETE - ' + style.icon + ' ' + style.name);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});