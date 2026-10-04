# ⚡ Caching di GitHub Actions

Workflow ini menggunakan **3 layer caching** untuk mempercepat setiap run.

## Layer Cache

### 1. FFmpeg Binary Cache

- **Path**: `/usr/bin/ffmpeg`, `/usr/bin/ffprobe`, `/usr/lib/x86_64-linux-gnu/libav*`
- **Key**: `ffmpeg-Linux-static-v1`
- **Benefit**: Skip `apt-get install ffmpeg` (~30 detik → 0 detik)

### 2. Node Modules Cache

- **Path**: `node_modules`
- **Key**: `node-modules-Linux-{hash package.json}`
- **Benefit**: Skip `npm install` (~20 detik → 0 detik)

### 3. GitHub Actions Built-in Cache

- **actions/setup-node** otomatis cache npm cache folder

## Perbandingan Waktu

| Step | Tanpa Cache | Dengan Cache |
|------|:-----------:|:------------:|
| Checkout | 3s | 3s |
| Install FFmpeg | 30s | **0s** ⚡ |
| Setup Node | 2s | 2s |
| Npm Install | 20s | **0s** ⚡ |
| Download video | 30s | 30s |
| Convert video | 60s | 60s |
| Upload | 10s | 10s |
| **Total** | **155s** | **105s** |

**Hemat: ~50 detik per run (32% lebih cepat)**

## Kapan Cache Digunakan

- **Cache HIT**: Kalau sudah pernah run, skip install → cepat
- **Cache MISS**: Run pertama kali atau package.json berubah → install normal

## Cara Clear Cache

Kalau ada masalah dengan cache (corrupt, dll):

1. Buka repo → **Actions** → **Caches** (di sidebar kiri)
2. Cari cache yang mau dihapus
3. Klik tombol **Delete** (trash icon)
4. Run ulang workflow

Atau ubah `key` di workflow (misal `ffmpeg-v1` → `ffmpeg-v2`) untuk invalidate semua cache.

## Limitasi

- Cache GitHub Actions max **10 GB per repo**
- Cache expire setelah **7 hari tidak diakses**
- Cache bisa digunakan lintas branch (kalau sama key)

## Advance: Cache Seluruh Ubuntu Image

Kalau mau lebih cepat lagi (hampir instant), bisa pakai:

- **Self-hosted runner** — VPS sendiri, no install needed
- **Docker image pre-built** — pakai `container:` di workflow
- **Pre-built action** — wrap FFmpeg dalam Docker

Tapi untuk sekarang, **3 layer caching** sudah sangat efisien.