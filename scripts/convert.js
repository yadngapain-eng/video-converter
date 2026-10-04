/* ============================================
   CONVERT VIDEO - AUTO QUALITY LOCK
   Flow:
   1. Deteksi kualitas video
   2. Upscale kalau perlu
   3. Convert ke 9:16 dengan setting platform
   4. Lock kualitas ke maksimal
   ============================================ */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getPlatform, listPlatforms } = require('./platforms.js');
const { detectQuality } = require('./detect-quality.js');
const { upscaleVideo, needsUpscale } = require('./upscale.js');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🎬 CONVERT VIDEO — AUTO QUALITY LOCK');
  console.log('='.repeat(60));
  console.log('');

  // ============================================
  // STEP 1: Baca platform dari env
  // ============================================
  const platformName = process.env.PLATFORM || 'universal';
  const platform = getPlatform(platformName);

  console.log('📱 Platform: ' + platform.icon + ' ' + platform.name);
  console.log('   ' + platform.notes);
  console.log('');
  console.log('📊 Target quality:');
  console.log('   • Resolusi: ' + platform.width + 'x' + platform.height);
  console.log('   • FPS: ' + platform.fps);
  console.log('   • Bitrate: ' + platform.videoBitrate);
  console.log('   • Max size: ' + platform.maxSizeMB + ' MB');
  console.log('   • Max duration: ' + platform.maxDuration + ' detik');
  console.log('');

  // ============================================
  // STEP 2: Cari video input
  // ============================================
  const files = fs.readdirSync('input');
  const videoFiles = files.filter(f => /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i.test(f));

  if (videoFiles.length === 0) {
    console.error('ERROR: tidak ada video di input/');
    process.exit(1);
  }

  const inputFile = path.join('input', videoFiles[0]);
  const baseName = path.parse(videoFiles[0]).name;

  console.log('📁 Input: ' + inputFile);

  // ============================================
  // STEP 3: Deteksi kualitas video
  // ============================================
  const quality = detectQuality(inputFile);

  if (quality.error) {
    console.error('❌ Gagal deteksi kualitas, lanjut dengan default');
  }

  // ============================================
  // STEP 4: Cek perlu upscale atau tidak
  // ============================================
  const issues = needsUpscale(quality, platform);

  if (issues.length > 0) {
    console.log('⚠️  Video di bawah standar ' + platform.name);
    console.log('   Perlu upscale: ' + issues.join(', '));
    console.log('');

    // ============================================
    // STEP 4a: Upscale video
    // ============================================
    ensureDir('temp');
    const upscaledFile = path.join('temp', 'upscaled.mp4');

    await upscaleVideo(inputFile, upscaledFile, quality, platform);

    // Pakai file yang sudah di-upscale
    var workingFile = upscaledFile;
  } else {
    console.log('✅ Kualitas video sudah OK untuk ' + platform.name);
    var workingFile = inputFile;
  }

  console.log('');

  // ============================================
  // STEP 5: Convert ke 9:16 dengan aesthetic
  // ============================================
  console.log('='.repeat(60));
  console.log('🎨 CONVERT KE 9:16 (AESTHETIC)');
  console.log('='.repeat(60));
  console.log('');

  ensureDir('output');
  const outputFile = path.join('output', baseName + '_shorts.mp4');

  // Deteksi kualitas video working
  const workingQuality = detectQuality(workingFile);

  const videoAreaHeight = Math.floor(platform.height * platform.videoScale);

  // Build filter aesthetic
  var bgFilters = [
    'scale=' + platform.width + ':' + platform.height + ':force_original_aspect_ratio=increase',
    'crop=' + platform.width + ':' + platform.height,
    'vflip',
    'gblur=sigma=' + platform.blur,
    'eq=brightness=' + (platform.brightness - 1).toFixed(2) + ':saturation=' + platform.saturation,
  ];

  const bgChain = '[bg]' + bgFilters.join(',') + '[bgblur]';
  const fgChain = '[fg]scale=' + platform.width + ':' + videoAreaHeight + ':force_original_aspect_ratio=decrease[fgscaled]';
  const overlay = '[bgblur][fgscaled]overlay=(W-w)/2:(H-h)/2[out]';

  const filter = [
    '[0:v]split=2[bg][fg]',
    bgChain,
    fgChain,
    overlay,
  ].join(';');

  console.log('📐 Target: ' + platform.width + 'x' + platform.height);
  console.log('🎬 FPS: ' + platform.fps);
  console.log('📊 Bitrate: ' + platform.videoBitrate);
  console.log('🎨 Preset: ' + platform.preset);
  console.log('🎯 CRF: ' + platform.crf);
  console.log('');
  console.log('🔧 Filter:');
  console.log(filter);
  console.log('');

  // ============================================
  // BUILD FFMPEG COMMAND
  // ============================================
  const cmd = [
    'ffmpeg',
    '-i', '"' + workingFile + '"',
    '-filter_complex', '"' + filter + '"',
    '-map', '"[out]"',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', platform.preset,
    '-crf', platform.crf.toString(),
    '-b:v', platform.videoBitrate,
    '-maxrate', platform.videoBitrate,
    '-bufsize', '20M',
    '-profile:v', 'high',
    '-level', '4.2',
    '-pix_fmt', 'yuv420p',
    '-r', platform.fps.toString(),
    '-c:a', 'aac',
    '-b:a', platform.audioBitrate,
    '-ar', '48000',
    '-movflags', '+faststart',
    '-y', '"' + outputFile + '"',
  ].join(' ');

  console.log('⏳ Processing video...');
  console.log('');

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('');
    console.log('✅ Convert selesai!');
  } catch (err) {
    console.error('❌ Convert gagal:', err.message);
    process.exit(1);
  }

  // ============================================
  // STEP 6: Verifikasi hasil
  // ============================================
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 VERIFIKASI HASIL');
  console.log('='.repeat(60));
  console.log('');

  const finalQuality = detectQuality(outputFile);
  const stats = fs.statSync(outputFile);
  const finalSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log('✅ Kualitas final:');
  console.log('   📐 Resolusi: ' + finalQuality.resolution);
  console.log('   📊 Bitrate: ' + finalQuality.bitrateMbps + ' Mbps');
  console.log('   🎬 FPS: ' + finalQuality.fps);
  console.log('   📦 Size: ' + finalSizeMB + ' MB');
  console.log('   ⏱️  Durasi: ' + finalQuality.duration.toFixed(2) + ' detik');
  console.log('');

  // Cek limit size
  if (parseFloat(finalSizeMB) > platform.maxSizeMB) {
    console.log('⚠️  Size melebihi limit ' + platform.name + ' (' + platform.maxSizeMB + ' MB)');
    console.log('   Rekomendasi: kurangi bitrate atau durasi');
  } else {
    console.log('✅ Size OK untuk ' + platform.name);
  }

  // Cek durasi
  if (finalQuality.duration > platform.maxDuration) {
    console.log('⚠️  Durasi melebihi limit ' + platform.maxDuration + 's');
  } else {
    console.log('✅ Durasi OK');
  }

  // ============================================
  // SAVE INFO
  // ============================================
  fs.writeFileSync('output/info.txt', outputFile);
  fs.writeFileSync('output/platform.txt', platformName);
  fs.writeFileSync('output/quality.json', JSON.stringify({
    platform: platformName,
    original: quality,
    final: finalQuality,
    fileSizeMB: finalSizeMB,
    upscaled: issues.length > 0,
    issues: issues,
  }, null, 2));

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ CONVERT COMPLETE — ' + platform.icon + ' ' + platform.name);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});