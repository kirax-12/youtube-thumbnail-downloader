# YouTube Thumbnail Downloader — Ambil Thumbnail Video YouTube Semua Ukuran

**Demo live:** [youtube-thumbnail-downloader di GitHub Pages](https://kirax-12.github.io/youtube-thumbnail-downloader/)

Web app statis buat download thumbnail video YouTube dalam **semua ukuran resmi**: dari HD 1280×720 sampai 120×90. Tinggal tempel link video (atau Shorts), pilih ukuran, klik download. Gratis, tanpa daftar, tanpa install apa-apa.

Dibuat oleh **Remike Dev**.

## Fitur

- **Semua ukuran thumbnail resmi YouTube** dalam satu layar:

  | Nama file         | Label    | Ukuran    |
  | ----------------- | -------- | --------- |
  | `maxresdefault`   | HD Penuh | 1280 × 720 |
  | `sddefault`       | SD       | 640 × 480  |
  | `hqdefault`       | HQ       | 480 × 360  |
  | `mqdefault`       | MQ       | 320 × 180  |
  | `default`         | Kecil    | 120 × 90   |

- **Deteksi thumbnail yang tidak tersedia** — video lama atau video tanpa thumbnail HD tidak punya `maxresdefault`; YouTube menggantinya dengan gambar placeholder 120×90. Aplikasi memeriksa `naturalWidth` gambar yang termuat: kalau resolusi besar tapi yang datang cuma placeholder, kartunya ditandai **“tidak tersedia”**, tampil grayscale, dan tombol download-nya dimatikan.
- **Pratinjau asli di setiap kartu** — yang kamu lihat adalah file yang bakal kamu unduh, lengkap dengan resolusi aktualnya.
- **Banyak format link diterima**: `youtube.com/watch?v=…`, `youtu.be/…`, `/shorts/…`, `/embed/…`, `/live/…`, link musik, bahkan ID video polos (11 karakter).
- **Tombol Tempel** — paste link langsung dari clipboard.
- Download diusahakan langsung jadi file JPG (fetch → blob); kalau browser menolak, gambar dibuka di tab baru buat disimpan manual.
- Tampilan responsif, enak dipakai dari HP maupun desktop.

## Cara Pakai

1. Buka video di YouTube → **Bagikan** → **Salin tautan**.
2. Tempel link-nya di kolom yang tersedia, tekan **Ambil Thumbnail**.
3. Klik **Download JPG** di kartu ukuran yang kamu mau.

## Cara Kerja

Murni frontend, tidak ada server dan tidak ada API key. YouTube menyimpan thumbnail setiap video di pola URL yang tetap:

```
https://i.ytimg.com/vi/<VIDEO_ID>/<nama_file>.jpg
```

Jadi pekerjaan aplikasi ini cuma:

1. Mengekstrak `VIDEO_ID` dari link yang ditempel pengguna (mendukung `watch`, `youtu.be`, `shorts`, `embed`, `live`, dan ID polos).
2. Menampilkan kelima varian file sebagai kartu pratinjau.
3. Memeriksa mana yang beneran ada — varian yang hilang diganti server YouTube dengan placeholder 120×90, dan itu yang dideteksi lewat `naturalWidth` pada event `load` gambar.
4. Mengunduh file pilihan lewat Fetch API sebagai blob supaya langsung tersimpan sebagai JPG; kalau gagal, fallback membuka gambarnya di tab baru.

Link yang dimasukkan pengguna tidak disimpan, tidak dicatat, dan tidak dikirim ke mana-mana — browser langsung mengambil gambar dari server gambar YouTube (`i.ytimg.com`).

## Cara Menjalankan

Paling gampang: buka file `index.html` langsung di browser.

Atau jalankan server lokal dari folder ini:

```bash
npx serve .
# atau
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.

Buat online: repo ini bisa langsung di-deploy sebagai situs statis, misalnya lewat **GitHub Pages** (Settings → Pages → deploy from branch `main`, folder root) atau Netlify/Vercel dengan drag-and-drop folder.

Catatan: fitur tombol **Tempel** (baca clipboard) butuh konteks aman — jalan di `https://` atau `localhost`, tapi mungkin dibatasi browser kalau file dibuka langsung dari disk. Paste manual tetap bisa.

## Teknologi

- HTML, CSS, dan JavaScript vanilla — tanpa framework, tanpa build step.
- Fetch API untuk mengunduh gambar sebagai blob.
- Desain neo-brutalist khas Remike Dev: latar cream `#FFF8EC`, border hitam 2px, bayangan offset keras, aksen kuning/pink/biru/hijau, font Space Grotesk + Space Mono + Caveat (Google Fonts).

## Struktur File

```
youtube-thumbnail-downloader/
├── index.html   # struktur halaman
├── style.css    # styling (design system Remike Web Style)
├── script.js    # ekstrak ID video, render kartu thumbnail, download
└── README.md
```

## Etika Pemakaian

Thumbnail tetap milik kreator videonya. Pakai buat referensi desain, bahan belajar, atau kebutuhan pribadi — jangan diklaim sebagai karya sendiri dan jangan dipakai buat thumbnail clickbait yang meniru video orang lain.
