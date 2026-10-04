/* ============================================
   UPSCALE VIDEO
   Naikkan kualitas kalau di bawah minimum
   ============================================ */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function needsUpscale(quality, platform) {
  const issues = [];

  // Cek resolusi
  if (quality.width < platform.minWidth || quality.height < platform.minHeight) {
    issues.push('resolusi');
  }

  // Cek bitrate
  if (quality.bitrate > 0 && quality.bitrate < platform.minBitrate * 1000) {
    issues.push('bitrate');
  }

  // Cek durasi
  if (quality.duration > platform.maxDuration) {
    issues.push('durasi');
  }

  return issues;
}

async function upscaleVideo(inputPath, outputPath, quality, platform) {
  console.log('');
  console.log('='.repeat(60));
  console.log('⬆️  UPSCALE VIDEO');
  console.log('='.repeat(60));
  console.log('');

  const issues = needsUpscale(quality, platform);

  if (issues.length === 0) {
    console.log('✅ Kualitas sudah OK untuk ' + platform.name);
    console.log('   Tidak perlu upscale');
    console.log('');
    // Copy file asli
    fs.copyFileSync(inputPath, outputPath);
    return false;
  }

  console.log('⚠️  Perlu upscale:');
  issues.forEach(function(issue) {
    console.log('   • ' + issue);
  });
  console.log('');
  console.log('📊 Target ' + platform.name + ':');
  console.log('   • Resolusi: ' + platform.minWidth + 'x' + platform.minHeight);
  console.log('   • Bitrate: ' + (platform.minBitrate / 1000) + ' Mbps');
  console.log('   • Durasi: ' + platform.maxDuration + ' detik');
  console.log('');

  // ============================================
  // BUILD FILTER UPSCALE
  // ============================================
  //
  // 1. Scale ke resolusi target dengan lanczos (high quality)
  // 2. Tingkatkan bitrate
  // 3. Preserve aspect ratio
  //
  const targetW = Math.max(quality.width, platform.minWidth);
  const targetH = Math.max(quality.height, platform.minHeight);

  // Trim durasi kalau lebih
  var trimArgs = '';
  if (quality.duration > platform.maxDuration) {
    trimArgs = ' -t ' + platform.maxDuration;
    console.log('✂️  Trim durasi dari ' + quality.duration.toFixed(1) + 's → ' + platform.maxDuration + 's');
  }

  // Filter: scale lanczos + sharpen ringan
  const filter = 'scale=' + targetW + ':' + targetH + ':flags=lanczos,unsharp=5:5:0.8:3:3:0.4';

  const cmd = [
    'ffmpeg',
    '-i', '"' + inputPath + '"',
    '-vf', '"' + filter + '"',
    '-c:v', 'libx264',
    '-preset', 'slow',                // Slow = high quality
    '-crf', '16',                     // Very high quality
    '-b:v', platform.videoBitrate,    // Target bitrate
    '-maxrate', platform.videoBitrate,
    '-bufsize', '20M',
    '-pix_fmt', 'yuv420p',
    '-r', platform.fps.toString(),
    '-c:a', 'aac',
    '-b:a', platform.audioBitrate,
    '-movflags', '+faststart',
    trimArgs,
    '-y', '"' + outputPath + '"',
  ].join(' ');

  console.log('⏳ Processing upscale...');
  console.log('');

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('');
    console.log('✅ Upscale selesai!');
    return true;
  } catch (err) {
    console.error('❌ Upscale gagal:', err.message);
    throw err;
  }
}

module.exports = { upscaleVideo, needsUpscale };