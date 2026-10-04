/* ============================================
   CONVERT VIDEO — SINGLE PASS + AUTO QUALITY LOCK
   ============================================ */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { getPlatform } = require('./platforms.js');
const { getStyle }    = require('./styles.js');
const { detectQuality } = require('./detect-quality.js');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  console.log('='.repeat(60));
  console.log('🎬 CONVERT VIDEO — SINGLE PASS + AUTO QUALITY LOCK');
  console.log('='.repeat(60));
  console.log('');

  const platformName = process.env.PLATFORM || 'universal';
  const styleName    = process.env.STYLE    || 'clean-modern';
  const platform     = getPlatform(platformName);
  const style        = getStyle(styleName);

  console.log(`📱 Platform: ${platform.icon} ${platform.name}`);
  console.log(`🎨 Style   : ${style.icon} ${style.name} — ${style.description}`);
  console.log('');

  const files = fs.readdirSync('input');
  const videoFiles = files.filter(f => /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i.test(f));
  if (videoFiles.length === 0) {
    console.error('❌ Tidak ada video di input/');
    process.exit(1);
  }
  const inputFile = path.join('input', videoFiles[0]);
  const baseName  = path.parse(videoFiles[0]).name;
  console.log(`📁 Input   : ${inputFile}`);

  const quality = detectQuality(inputFile);
  if (quality.error) {
    console.error('⚠️  Gagal deteksi kualitas, lanjut dengan default');
  }

  const targetW = platform.width;
  const targetH = platform.height;
  const fgH     = Math.floor(targetH * style.videoScale);
  const fgW     = targetW;

  console.log('');
  console.log('📊 Target output:');
  console.log(`   • Kanvas    : ${targetW}x${targetH}`);
  console.log(`   • Foreground: ${fgW}x${fgH} (scale ${style.videoScale})`);
  console.log(`   • FPS       : ${platform.fps}`);
  console.log(`   • Bitrate   : ${platform.videoBitrate}`);
  console.log(`   • Blur      : ${style.blur}`);
  console.log(`   • Brightness: ${style.brightness}`);
  console.log(`   • Saturation: ${style.saturation}`);
  console.log(`   • VFlip     : ${style.vflip}`);
  console.log('');

  const bgFilters = [
    `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase`,
    `crop=${targetW}:${targetH}`,
  ];
  if (style.vflip) bgFilters.push('vflip');
  bgFilters.push(`gblur=sigma=${style.blur}`);
  bgFilters.push(`eq=brightness=${(style.brightness - 1).toFixed(2)}:saturation=${style.saturation}`);

  const bgChain      = `[bg]${bgFilters.join(',')}[bgblur]`;
  const fgChain      = `[fg]scale=${fgW}:${fgH}:force_original_aspect_ratio=decrease[fgscaled]`;
  const overlayChain = `[bgblur][fgscaled]overlay=(W-w)/2:(H-h)/2[out]`;

  const filter = [
    '[0:v]split=2[bg][fg]',
    bgChain,
    fgChain,
    overlayChain,
  ].join(';');

  console.log('🔧 Filter:');
  console.log(filter);
  console.log('');

  ensureDir('output');
  const outputFile = path.join('output', `${baseName}_shorts.mp4`);

  const args = [
    '-i', inputFile,
    '-filter_complex', filter,
    '-map', '[out]',
    '-map', '0:a?',
    '-c:v', platform.codec,
    '-preset', platform.preset,
    '-crf', String(platform.crf),
    '-b:v', platform.videoBitrate,
    '-maxrate', platform.videoBitrate,
    '-bufsize', '20M',
    '-profile:v', 'high',
    '-level', '4.2',
    '-pix_fmt', 'yuv420p',
    '-r', String(platform.fps),
    '-c:a', 'aac',
    '-b:a', platform.audioBitrate,
    '-ar', '48000',
    '-movflags', '+faststart',
    '-y', outputFile,
  ];

  console.log('⏳ Processing video (single pass)...');
  console.log('');

  try {
    execFileSync('ffmpeg', args, { stdio: 'inherit' });
    console.log('');
    console.log('✅ Convert selesai!');
  } catch (err) {
    console.error('❌ Convert gagal:', err.message);
    process.exit(1);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('📊 VERIFIKASI HASIL');
  console.log('='.repeat(60));
  console.log('');

  const finalQuality = detectQuality(outputFile);
  const stats        = fs.statSync(outputFile);
  const finalSizeMB  = (stats.size / 1024 / 1024).toFixed(2);

  console.log('✅ Kualitas final:');
  console.log(`   📐 Resolusi: ${finalQuality.resolution}`);
  console.log(`   📊 Bitrate : ${finalQuality.bitrateMbps} Mbps`);
  console.log(`   🎬 FPS     : ${finalQuality.fps}`);
  console.log(`   📦 Size    : ${finalSizeMB} MB`);
  console.log(`   ⏱️  Durasi  : ${finalQuality.duration.toFixed(2)} detik`);
  console.log('');

  if (parseFloat(finalSizeMB) > platform.maxSizeMB) {
    console.log(`⚠️  Size melebihi limit ${platform.name} (${platform.maxSizeMB} MB)`);
  } else {
    console.log(`✅ Size OK untuk ${platform.name}`);
  }

  if (finalQuality.duration > platform.maxDuration) {
    console.log(`⚠️  Durasi melebihi limit ${platform.maxDuration}s`);
  } else {
    console.log('✅ Durasi OK');
  }

  fs.writeFileSync('output/info.txt', outputFile);
  fs.writeFileSync('output/platform.txt', platformName);
  fs.writeFileSync('output/style.txt', styleName);
  fs.writeFileSync('output/quality.json', JSON.stringify({
    platform: platformName,
    style: styleName,
    original: quality,
    final: finalQuality,
    fileSizeMB: finalSizeMB,
  }, null, 2));

  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ CONVERT COMPLETE — ${platform.icon} ${platform.name} • ${style.icon} ${style.name}`);
  console.log('='.repeat(60));
}

main();
