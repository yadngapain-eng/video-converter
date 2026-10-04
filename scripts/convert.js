/* CONVERT VIDEO TO 9:16 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('='.repeat(60));
  console.log('CONVERT TO 9:16');
  console.log('='.repeat(60));
  const config = {
    blurStrength: parseFloat(process.env.BLUR_STRENGTH || '30'),
    brightness: parseFloat(process.env.BRIGHTNESS || '0.5'),
    marginTop: parseFloat(process.env.MARGIN_TOP || '0.12'),
    marginBottom: parseFloat(process.env.MARGIN_BOTTOM || '0.12'),
    targetWidth: 1080,
    targetHeight: 1920,
  };
  console.log('Config:');
  console.log('  Target: ' + config.targetWidth + 'x' + config.targetHeight);
  console.log('  Blur: ' + config.blurStrength);
  const files = await fs.readdir('input');
  const videoFiles = files.filter(f => /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i.test(f));
  if (videoFiles.length === 0) { console.error('ERROR: no video in input/'); process.exit(1); }
  const inputFile = path.join('input', videoFiles[0]);
  const baseName = path.parse(videoFiles[0]).name;
  console.log('Input: ' + inputFile);
  await fs.ensureDir('output');
  const outputFile = path.join('output', baseName + '_shorts.mp4');
  const marginTopPx = Math.floor(config.targetHeight * config.marginTop);
  const videoAreaHeight = config.targetHeight - marginTopPx * 2;
  console.log('Video area: ' + config.targetWidth + 'x' + videoAreaHeight);
  const filter = [
    '[0:v]split=2[bg][fg]',
    '[bg]scale=' + config.targetWidth + ':' + config.targetHeight + ':force_original_aspect_ratio=increase',
    'crop=' + config.targetWidth + ':' + config.targetHeight,
    'gblur=sigma=' + config.blurStrength,
    'eq=brightness=-' + (1 - config.brightness).toFixed(2) + ':saturation=0.7[bgblur]',
    '[fg]scale=' + config.targetWidth + ':' + videoAreaHeight + ':force_original_aspect_ratio=decrease[fgscaled]',
    '[bgblur][fgscaled]overlay=(W-w)/2:' + marginTopPx + '[out]',
  ].join(';');
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
  console.log('');
  console.log('Processing video...');
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('');
    console.log('Convert selesai!');
  } catch (err) {
    console.error('Convert gagal:', err.message);
    process.exit(1);
  }
  const stats = await fs.stat(outputFile);
  console.log('Output: ' + outputFile);
  console.log('Size: ' + (stats.size / 1024 / 1024).toFixed(1) + ' MB');
  await fs.writeFile('output/info.txt', outputFile);
  console.log('='.repeat(60));
  console.log('CONVERT COMPLETE');
  console.log('='.repeat(60));
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });