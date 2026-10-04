# 🎬 Video Converter 9:16

Convert video dari **Google Drive link** jadi format **YouTube Shorts** (9:16), hasil otomatis ke **GitHub Release**.

## ✨ Fitur

- ✅ Input: **Link Google Drive** (public)
- ✅ Convert ke **9:16** (1080x1920)
- ✅ Video utama di **tengah**, background blur
- ✅ Output ke **GitHub Release** — download kapan saja
- ✅ **3-layer caching** — run 2-5x lebih cepat
- ✅ 100% jalan di **GitHub Actions** (gratis)

## 🚀 Cara Pakai

### 1. Siapkan link Google Drive

Upload video ke Google Drive → klik kanan → **Share** → **Anyone with link** → copy link.

Format link yang didukung:
```
https://drive.google.com/file/d/ABC123/view?usp=sharing
https://drive.google.com/open?id=ABC123
https://drive.google.com/uc?id=ABC123
```

### 2. Trigger GitHub Actions

1. Buka tab **Actions** di GitHub
2. Pilih workflow **Convert Video to 9:16**
3. Klik **Run workflow**
4. Isi form:
   - **Google Drive Link**: paste link
   - **Release Tag**: `v1` (harus unik)
   - **Blur Strength**: 30
5. Klik **Run workflow**

### 3. Tunggu hasilnya

- **Run pertama**: ~2-3 menit (install FFmpeg)
- **Run berikutnya**: ~1-2 menit (cache hit ⚡)
- Buka tab **Releases** → download video

## ⚡ Caching (BARU!)

Repo ini sudah pakai **3-layer caching** untuk speed:

| Layer | Speedup |
|-------|:-------:|
| FFmpeg binary | ~30 detik |
| Node modules | ~20 detik |
| GitHub cache | auto |

**Hemat ~50 detik per run!**

Detail: lihat [CACHING.md](CACHING.md)

## 🎨 Setting

Di workflow form:
- **Blur Strength**: 5-80 (default 30)
- **Brightness**: 0.2-1.0 (default 0.5)
- **Margin Top**: 0-0.3 (default 0.12)
- **Margin Bottom**: 0-0.3 (default 0.12)

## 📊 Format Output

```
+-------------+
|             |  <- Blur background
|  +-------+  |
|  | VIDEO |  |  <- Video utama (tengah)
|  | UTAMA |  |
|  +-------+  |
|             |
|  1080x1920  |
+-------------+
```

## 📝 License

MIT