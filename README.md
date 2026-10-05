# 🎬 Video Converter 9:16

Convert video dari Google Drive jadi **YouTube Shorts / Reels / TikTok (9:16)** dengan style aesthetic + auto quality lock per platform.

## ✨ Fitur

- 📥 **Download dari Google Drive** — 4 URL fallback, anti-gagal
- 🎨 **10 Style Aesthetic** — pilih dari dropdown
- 📱 **6 Platform Preset** — auto-lock resolusi/bitrate/limit
- ⚡ **Single-pass FFmpeg** — 1× encode, kualitas maksimal
- 🔍 **Auto Quality Detect** — ffprobe baca resolusi/bitrate/FPS
- ⬆️ **Auto Upscale** — kalau di bawah standar platform
- ✅ **Size Validation** — cek sebelum upload
- 💾 **3-layer Caching** — FFmpeg + Node modules
- 🔒 **Concurrency Lock** — anti-tabrakan tag sama

## 🌐 Sumber Video yang Didukung

Auto-detect URL — tinggal paste link, script tahu harus pakai downloader mana:

| Situs | Contoh |
|-------|--------|
| 🟢 Google Drive | `https://drive.google.com/file/d/.../view` |
| ▶️ YouTube (video & Shorts) | `https://youtube.com/watch?v=...` |
| ▶️ YouTube Shorts | `https://youtube.com/shorts/...` |
| 📘 Facebook | `https://facebook.com/.../videos/...` |
| 📘 Facebook Watch | `https://fb.watch/...` |
| 📸 Instagram Reels/Post | `https://instagram.com/reel/...` |
| 🎵 TikTok | `https://tiktok.com/@user/video/...` |
| 🐦 Twitter / X | `https://x.com/user/status/...` |
| 🎬 Vimeo | `https://vimeo.com/...` |
| 📺 Dailymotion | `https://dailymotion.com/video/...` |
| 👽 Reddit | `https://reddit.com/r/.../comments/...` |
| 🟣 Twitch VOD | `https://twitch.tv/videos/...` |
| ➕ 1000+ lainnya | Didukung oleh `yt-dlp` |

## 🎨 Style Preset (10 pilihan)

| Style | Ikon | Deskripsi | Blur | Brightness |
|-------|:----:|-----------|:----:|:----------:|
| `clean-modern` | ✨ | Terang, tajam, modern | 15 | 0.70 |
| `soft-dreamy` | 🌸 | Lembut, dreamy, glow | 30 | 0.75 |
| `cinematic-dark` | 🎬 | Gelap, elegan, cinematic | 25 | 0.40 |
| `vibrant-vivid` | 🌈 | Warna cerah, vivid | 10 | 0.85 |
| `subtle-aesthetic` | 🎨 | Aesthetic, subtle, kalem | 12 | 0.65 |
| `neon-glow` | ⚡ | Neon, glow, gaming | 20 | 0.60 |
| `vintage-film` | 📽️ | Vintage, film look | 22 | 0.55 |
| `pure-mirror` | 🪞 | Mirror tajam | 8 | 0.70 |
| `dark-elegant` | 🖤 | Dark, premium | 18 | 0.45 |
| `bright-pop` | ☀️ | Sangat terang, ceria | 12 | 0.90 |

## 📱 Platform Preset (6 pilihan)

| Platform | Resolusi | Bitrate | Max Size | Max Durasi |
|----------|:--------:|:-------:|:--------:|:----------:|
| `whatsapp` | 1080×1920 | 8M | 16 MB | 60s |
| `facebook` | 1080×1920 | 10M | 100 MB | 90s |
| `youtube` | 1080×1920 | 12M | ~unlimited | 60s |
| `tiktok` | 1080×1920 | 10M | 500 MB | 180s |
| `instagram` | 1080×1920 | 10M | 6.5 GB | 90s |
| `universal` | 1080×1920 | 8M | 16 MB | 60s |

## 🚀 Cara Pakai

1. Upload video ke Google Drive → Share → **Anyone with link**
2. Buka tab **Actions** → workflow **Convert Video to 9:16**
3. Klik **Run workflow**, isi form:
   - **Google Drive Link**: paste link
   - **Release Tag**: `v1`
   - **Platform**: pilih dari dropdown
   - **Style**: pilih dari dropdown
   - **Strict size check**: centang kalau mau fail saat melebihi limit
4. Klik **Run workflow**
5. Tunggu ~1 menit
6. Cek **Releases** → download video

## 🔧 Struktur

```
.github/workflows/convert.yml   # GitHub Actions workflow
scripts/
  ├── download.js               # Download dari Google Drive
  ├── convert.js                # FFmpeg single-pass + style
  ├── platforms.js              # Preset platform
  ├── styles.js                 # Preset style
  └── detect-quality.js         # ffprobe wrapper
package.json
README.md
```

## 📄 License

MIT
