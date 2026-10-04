/* ============================================
   DETECT VIDEO QUALITY
   Baca resolusi, bitrate, framerate dari video
   ============================================ */

const { execSync } = require('child_process');

function detectQuality(videoPath) {
  console.log('');
  console.log('='.repeat(60));
  console.log('🔍 DETEKSI KUALITAS VIDEO');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Ambil info video via ffprobe
    const cmd = 'ffprobe -v error -select_streams v:0 ' +
      '-show_entries stream=width,height,r_frame_rate,bit_rate,codec_name,duration ' +
      '-of json "' + videoPath + '"';

    const output = execSync(cmd, { encoding: 'utf-8' });
    const data = JSON.parse(output);

    const stream = data.streams[0];
    const width = stream.width || 0;
    const height = stream.height || 0;
    const codec = stream.codec_name || 'unknown';

    // Bitrate: bisa di stream atau format level
    let bitrate = 0;
    if (stream.bit_rate) {
      bitrate = parseInt(stream.bit_rate);
    } else {
      // Coba dari format level
      const formatCmd = 'ffprobe -v error -show_entries format=bit_rate,duration -of json "' + videoPath + '"';
      const formatOutput = execSync(formatCmd, { encoding: 'utf-8' });
      const formatData = JSON.parse(formatOutput);
      bitrate = parseInt(formatData.format.bit_rate) || 0;
    }

    // FPS dari fractional
    let fps = 30;
    if (stream.r_frame_rate) {
      const parts = stream.r_frame_rate.split('/');
      if (parts.length === 2) {
        fps = Math.round(parseInt(parts[0]) / parseInt(parts[1]));
      }
    }

    // Duration
    let duration = 0;
    if (stream.duration) {
      duration = parseFloat(stream.duration);
    } else {
      const durCmd = 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "' + videoPath + '"';
      duration = parseFloat(execSync(durCmd, { encoding: 'utf-8' }).trim()) || 0;
    }

    const info = {
      width: width,
      height: height,
      fps: fps,
      bitrate: bitrate,
      bitrateMbps: (bitrate / 1000000).toFixed(2),
      codec: codec,
      duration: duration,
      resolution: width + 'x' + height,
    };

    console.log('📹 Kualitas video terdeteksi:');
    console.log('   📐 Resolusi: ' + info.resolution);
    console.log('   🎞️  Codec: ' + info.codec);
    console.log('   🎬 FPS: ' + info.fps);
    console.log('   📊 Bitrate: ' + info.bitrateMbps + ' Mbps');
    console.log('   ⏱️  Durasi: ' + info.duration.toFixed(2) + ' detik');
    console.log('');

    return info;
  } catch (err) {
    console.error('❌ Error deteksi kualitas:', err.message);
    return {
      width: 0,
      height: 0,
      fps: 30,
      bitrate: 0,
      bitrateMbps: '0.00',
      codec: 'unknown',
      duration: 0,
      resolution: 'unknown',
      error: err.message,
    };
  }
}

module.exports = { detectQuality };