/* ============================================
   STYLE PRESETS
   Setiap style = kombinasi parameter aesthetic
   ============================================ */

const STYLES = {
  // 1. Clean & Modern (default)
  'clean-modern': {
    name: 'Clean & Modern',
    icon: '✨',
    blur: 15,
    brightness: 0.7,
    saturation: 0.85,
    videoScale: 0.75,
    vflip: true,
    description: 'Terang, tajam, modern',
  },

  // 2. Soft Dreamy
  'soft-dreamy': {
    name: 'Soft Dreamy',
    icon: '🌸',
    blur: 30,
    brightness: 0.75,
    saturation: 0.9,
    videoScale: 0.72,
    vflip: true,
    description: 'Lembut, dreamy, glow',
  },

  // 3. Cinematic Dark
  'cinematic-dark': {
    name: 'Cinematic Dark',
    icon: '🎬',
    blur: 25,
    brightness: 0.4,
    saturation: 0.6,
    videoScale: 0.7,
    vflip: true,
    description: 'Gelap, elegan, cinematic',
  },

  // 4. Vibrant Vivid
  'vibrant-vivid': {
    name: 'Vibrant Vivid',
    icon: '🌈',
    blur: 10,
    brightness: 0.85,
    saturation: 1.1,
    videoScale: 0.8,
    vflip: true,
    description: 'Warna cerah, vivid, punchy',
  },

  // 5. Subtle Aesthetic
  'subtle-aesthetic': {
    name: 'Subtle Aesthetic',
    icon: '🎨',
    blur: 12,
    brightness: 0.65,
    saturation: 0.75,
    videoScale: 0.75,
    vflip: true,
    description: 'Aesthetic, subtle, kalem',
  },

  // 6. Neon Glow
  'neon-glow': {
    name: 'Neon Glow',
    icon: '⚡',
    blur: 20,
    brightness: 0.6,
    saturation: 1.3,
    videoScale: 0.75,
    vflip: true,
    description: 'Warna neon, glow, gaming',
  },

  // 7. Vintage Film
  'vintage-film': {
    name: 'Vintage Film',
    icon: '📽️',
    blur: 22,
    brightness: 0.55,
    saturation: 0.7,
    videoScale: 0.72,
    vflip: true,
    description: 'Vintage, film look, retro',
  },

  // 8. Pure Mirror
  'pure-mirror': {
    name: 'Pure Mirror',
    icon: '🪞',
    blur: 8,
    brightness: 0.7,
    saturation: 0.9,
    videoScale: 0.78,
    vflip: true,
    description: 'Mirror tajam, hampir tanpa blur',
  },

  // 9. Dark Elegant
  'dark-elegant': {
    name: 'Dark Elegant',
    icon: '🖤',
    blur: 18,
    brightness: 0.45,
    saturation: 0.75,
    videoScale: 0.73,
    vflip: true,
    description: 'Dark, elegant, premium',
  },

  // 10. Bright Pop
  'bright-pop': {
    name: 'Bright Pop',
    icon: '☀️',
    blur: 12,
    brightness: 0.9,
    saturation: 1.0,
    videoScale: 0.78,
    vflip: true,
    description: 'Sangat terang, pop, ceria',
  },
};

// ============================================
// GET STYLE BY NAME
// ============================================
function getStyle(name) {
  if (STYLES[name]) {
    return STYLES[name];
  }
  // Fallback ke clean-modern
  console.warn('Style "' + name + '" tidak ditemukan, pakai clean-modern');
  return STYLES['clean-modern'];
}

// ============================================
// LIST ALL STYLES
// ============================================
function listStyles() {
  console.log('Available styles:');
  Object.keys(STYLES).forEach(function(key) {
    var s = STYLES[key];
    console.log('  ' + s.icon + ' ' + key + ' — ' + s.name + ' (' + s.description + ')');
  });
}

module.exports = { STYLES, getStyle, listStyles };