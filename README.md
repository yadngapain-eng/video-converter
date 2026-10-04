# Video Converter 9:16

Convert video dari Google Drive link jadi format YouTube Shorts (9:16), hasil otomatis ke GitHub Release.

## Fitur

- Input: Link Google Drive (public)
- Convert ke 9:16 (1080x1920)
- Video utama di tengah, background blur
- Output ke GitHub Release - download kapan saja
- 100% jalan di GitHub Actions (gratis)

## Cara Pakai

### 1. Siapkan link Google Drive

Upload video ke Google Drive, klik kanan, Share, Anyone with link, copy link.

Format link yang didukung:

    https://drive.google.com/file/d/ABC123/view?usp=sharing
    https://drive.google.com/open?id=ABC123
    https://drive.google.com/uc?id=ABC123

### 2. Trigger GitHub Actions

1. Buka tab Actions di GitHub
2. Pilih workflow Convert Video to 9:16
3. Klik Run workflow
4. Isi form
5. Klik Run workflow

### 3. Tunggu hasilnya

- Proses 1-5 menit
- Buka tab Releases di repo
- Download video hasil konversi

## Setting

- Blur Strength: 5-80 (default 30)
- Brightness: 0.2-1.0 (default 0.5)
- Margin Top: 0-0.3 (default 0.12)
- Margin Bottom: 0-0.3 (default 0.12)

## License

MIT