const STYLES = {
  'clean-modern':    { name:'Clean Modern',    icon:'✨',  description:'Terang, tajam, modern', videoScale:0.85, blur:15, brightness:0.70, saturation:1.0, vflip:false },
  'soft-dreamy':     { name:'Soft Dreamy',     icon:'🌸',  description:'Lembut, dreamy, glow',  videoScale:0.80, blur:30, brightness:0.75, saturation:1.1, vflip:false },
  'cinematic-dark':  { name:'Cinematic Dark',  icon:'🎬',  description:'Gelap, elegan, cinematic', videoScale:0.85, blur:25, brightness:0.40, saturation:1.0, vflip:false },
  'vibrant-vivid':   { name:'Vibrant Vivid',   icon:'🌈',  description:'Warna cerah, vivid',    videoScale:0.88, blur:10, brightness:0.85, saturation:1.3, vflip:false },
  'subtle-aesthetic':{ name:'Subtle Aesthetic',icon:'🎨',  description:'Aesthetic, subtle, kalem', videoScale:0.82, blur:12, brightness:0.65, saturation:1.05, vflip:false },
  'neon-glow':       { name:'Neon Glow',       icon:'⚡',  description:'Neon, glow, gaming',     videoScale:0.80, blur:20, brightness:0.60, saturation:1.4, vflip:false },
  'vintage-film':    { name:'Vintage Film',    icon:'📽️', description:'Vintage, film look',     videoScale:0.84, blur:22, brightness:0.55, saturation:0.9, vflip:false },
  'pure-mirror':     { name:'Pure Mirror',     icon:'🪞',  description:'Mirror tajam',           videoScale:0.90, blur:8,  brightness:0.70, saturation:1.0, vflip:true },
  'dark-elegant':    { name:'Dark Elegant',    icon:'🖤',  description:'Dark, premium',          videoScale:0.85, blur:18, brightness:0.45, saturation:1.0, vflip:false },
  'bright-pop':      { name:'Bright Pop',      icon:'☀️', description:'Sangat terang, ceria',   videoScale:0.88, blur:12, brightness:0.90, saturation:1.2, vflip:false },
};
function getStyle(name) { return STYLES[name] || STYLES['clean-modern']; }
function listStyles() {
  console.log('Styles:');
  for (const [k,v] of Object.entries(STYLES)) {
    console.log(`  ${v.icon} ${k} - ${v.name} (${v.description})`);
  }
}
module.exports = { getStyle, listStyles, STYLES };
