const PLATFORMS = {
  universal: { name:'Universal', icon:'🌐', width:1080, height:1920, fps:30, videoBitrate:'8M', audioBitrate:'128k', maxSizeMB:16, maxDuration:60, codec:'libx264', preset:'medium', crf:23 },
  whatsapp:  { name:'WhatsApp',  icon:'💬', width:1080, height:1920, fps:30, videoBitrate:'8M', audioBitrate:'128k', maxSizeMB:16, maxDuration:60, codec:'libx264', preset:'medium', crf:23 },
  facebook:  { name:'Facebook',  icon:'📘', width:1080, height:1920, fps:30, videoBitrate:'10M', audioBitrate:'128k', maxSizeMB:100, maxDuration:90, codec:'libx264', preset:'medium', crf:21 },
  youtube:   { name:'YouTube',   icon:'▶️', width:1080, height:1920, fps:30, videoBitrate:'12M', audioBitrate:'192k', maxSizeMB:99999, maxDuration:60, codec:'libx264', preset:'slow', crf:20 },
  tiktok:    { name:'TikTok',    icon:'🎵', width:1080, height:1920, fps:30, videoBitrate:'10M', audioBitrate:'128k', maxSizeMB:500, maxDuration:180, codec:'libx264', preset:'medium', crf:21 },
  instagram: { name:'Instagram', icon:'📸', width:1080, height:1920, fps:30, videoBitrate:'10M', audioBitrate:'128k', maxSizeMB:6656, maxDuration:90, codec:'libx264', preset:'medium', crf:21 },
};
function getPlatform(name) { return PLATFORMS[name] || PLATFORMS.universal; }
function listPlatforms() {
  console.log('Platforms:');
  for (const [k,v] of Object.entries(PLATFORMS)) {
    console.log(`  ${v.icon} ${k} - ${v.name} (${v.width}x${v.height}, max ${v.maxSizeMB}MB, ${v.maxDuration}s)`);
  }
}
module.exports = { getPlatform, listPlatforms, PLATFORMS };
