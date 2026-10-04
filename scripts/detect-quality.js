const { execFileSync } = require('child_process');

function detectQuality(file) {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate,bit_rate,duration',
      '-of', 'json',
      file
    ]).toString();
    const data = JSON.parse(out);
    const stream = data.streams && data.streams[0];
    if (!stream) throw new Error('No video stream');
    const width = stream.width;
    const height = stream.height;
    const fpsNum = stream.r_frame_rate.split('/')[0];
    const fpsDen = stream.r_frame_rate.split('/')[1] || 1;
    const fps = Math.round(fpsNum / fpsDen);
    const bitrate = stream.bit_rate ? parseInt(stream.bit_rate) : 0;
    const duration = stream.duration ? parseFloat(stream.duration) : 0;
    return {
      width, height,
      resolution: `${width}x${height}`,
      bitrateMbps: (bitrate / 1000000).toFixed(2),
      fps, duration, error: null
    };
  } catch (e) {
    return { error: e.message, resolution: 'unknown', bitrateMbps: '0', fps: 0, duration: 0 };
  }
}

module.exports = { detectQuality };
