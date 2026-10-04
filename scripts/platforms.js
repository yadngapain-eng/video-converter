/* ============================================
   PLATFORM PRESETS
   Setting optimal untuk setiap platform
   ============================================ */

const PLATFORMS = {
  // ==========================================
  // WHATSAPP STATUS
  // ==========================================
  'whatsapp': {
    name: 'WhatsApp Status',
    icon: '📱',
    // Target
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrate: '8M',        // Bitrate tinggi untuk kualitas
    audioBitrate: '192k',
    // Min requirements
    minWidth: 720,
    minHeight: 1280,
    minBitrate: 4000,          // 4 Mbps minimal
    maxSizeMB: 16,             // WA limit 16 MB
    maxDuration: 60,           // 60 detik max
    // Aesthetic
    blur: 15,
    brightness: 0.7,
    saturation: 0.85,
    videoScale: 0.75,
    codec: 'libx264',
    preset: 'medium',          // Slower = better quality
    crf: 18,                   // Lower = better (18 = high quality)
    // Notes
    notes: 'WA kompres agresif, gunakan kualitas tinggi + bitrate max',
  },

  // ==========================================
  // FACEBOOK REELS
  // ==========================================
  'facebook': {
    name: 'Facebook Reels',
    icon: '📘',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrate: '10M',       // Bitrate lebih tinggi
    audioBitrate: '192k',
    minWidth: 1080,
    minHeight: 1920,
    minBitrate: 6000,          // 6 Mbps minimal
    maxSizeMB: 100,            // FB lebih toleran
    maxDuration: 90,
    blur: 15,
    brightness: 0.7,
    saturation: 0.9,
    videoScale: 0.75,
    codec: 'libx264',
    preset: 'medium',
    crf: 18,
    notes: 'FB lebih toleran, tapi tetap pakai bitrate tinggi',
  },

  // ==========================================
  // YOUTUBE SHORTS
  // ==========================================
  'youtube': {
    name: 'YouTube Shorts',
    icon: '📺',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrate: '12M',       // YouTube paling toleran
    audioBitrate: '192k',
    minWidth: 1080,
    minHeight: 1920,
    minBitrate: 8000,
    maxSizeMB: 256000,         // YT ~256 GB (unlimited practically)
    maxDuration: 60,
    blur: 15,
    brightness: 0.7,
    saturation: 0.9,
    videoScale: 0.78,
    codec: 'libx264',
    preset: 'slow',            // YT best = slow preset
    crf: 16,                   // YT best quality
    notes: 'YouTube rekomendasi bitrate 12 Mbps untuk 1080p',
  },

  // ==========================================
  // TIKTOK
  // ==========================================
  'tiktok': {
    name: 'TikTok',
    icon: '🎵',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrate: '10M',
    audioBitrate: '192k',
    minWidth: 1080,
    minHeight: 1920,
    minBitrate: 6000,
    maxSizeMB: 500,
    maxDuration: 180,          // TikTok max 3 min
    blur: 15,
    brightness: 0.7,
    saturation: 1.0,           // TikTok suka warna vivid
    videoScale: 0.75,
    codec: 'libx264',
    preset: 'medium',
    crf: 18,
    notes: 'TikTok support 1080p HD',
  },

  // ==========================================
  // INSTAGRAM REELS
  // ==========================================
  'instagram': {
    name: 'Instagram Reels',
    icon: '📸',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrate: '10M',
    audioBitrate: '192k',
    minWidth: 1080,
    minHeight: 1920,
    minBitrate: 6000,
    maxSizeMB: 6500,
    maxDuration: 90,
    blur: 15,
    brightness: 0.7,
    saturation: 0.9,
    videoScale: 0.75,
    codec: 'libx264',
    preset: 'medium',
    crf: 18,
    notes: 'IG reels support 1080p',
  },

  // ==========================================
  // UNIVERSAL (kompatibel semua)
  // ==========================================
  'universal': {
    name: 'Universal (semua platform)',
    icon: '🌐',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrate: '8M',
    audioBitrate: '192k',
    minWidth: 720,
    minHeight: 1280,
    minBitrate: 4000,
    maxSizeMB: 16,             // Pakai WA limit biar aman semua
    maxDuration: 60,
    blur: 15,
    brightness: 0.7,
    saturation: 0.85,
    videoScale: 0.75,
    codec: 'libx264',
    preset: 'medium',
    crf: 18,
    notes: 'Setting konservatif untuk kompatibel semua platform',
  },
};

function getPlatform(name) {
  if (PLATFORMS[name]) return PLATFORMS[name];
  console.warn('Platform "' + name + '" tidak ditemukan, pakai universal');
  return PLATFORMS['universal'];
}

function listPlatforms() {
  console.log('Available platforms:');
  Object.keys(PLATFORMS).forEach(function(key) {
    var p = PLATFORMS[key];
    console.log('  ' + p.icon + ' ' + key + ' — ' + p.name);
  });
}

module.exports = { PLATFORMS, getPlatform, listPlatforms };