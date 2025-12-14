# Troubleshooting Guide

## Masalah yang Sudah Diperbaiki

### 1. ✅ Error 401 Unauthorized
**Masalah**: Sync ke server gagal dengan error 401 Unauthorized

**Solusi**:
- Pastikan relay server berjalan dengan menjalankan: `npm run relay`
- Atau jalankan dev server dan relay server bersamaan: `npm run dev:all`
- Relay server berjalan di port 3001 dan diperlukan untuk sync data ke server

**Cara menjalankan**:
```bash
# Terminal 1: Jalankan dev server
npm run dev

# Terminal 2: Jalankan relay server
npm run relay

# Atau jalankan keduanya sekaligus (setelah install concurrently)
npm install
npm run dev:all
```

### 2. ✅ PWA Icon 404
**Masalah**: File `pwa-192x192.png` dan `pwa-512x512.png` tidak ditemukan

**Solusi**:
1. Generate icon dari SVG yang sudah dibuat:
   ```bash
   npm install sharp
   npm run generate-icons
   ```

2. Atau buat manual:
   - Buka `public/icon.svg` di browser atau editor
   - Export sebagai PNG dengan ukuran 192x192 dan 512x512
   - Simpan sebagai `pwa-192x192.png` dan `pwa-512x512.png` di folder `public/`

3. Atau gunakan online converter:
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
   - Upload `public/icon.svg` dan download dengan ukuran yang sesuai

### 3. ✅ React Router Warnings
**Masalah**: Warning tentang future flags di React Router

**Solusi**: Sudah ditambahkan future flags di `BrowserRouter` untuk menghilangkan warnings

## Masalah Lainnya

### Vite Connection Lost
Ini biasanya terjadi saat:
- Dev server restart
- File diubah dan Vite melakukan hot reload
- Tidak perlu khawatir, biasanya akan reconnect otomatis

### React DevTools Warning
Ini hanya informasi, bukan error. Install React DevTools browser extension untuk pengalaman development yang lebih baik.

## Cara Menjalankan Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan dev server dan relay server:
   ```bash
   npm run dev:all
   ```

3. Atau jalankan secara terpisah:
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   npm run relay
   ```

4. Buka browser di `http://localhost:5173` (atau port yang ditampilkan di terminal)

## Catatan Penting

- Relay server **WAJIB** berjalan untuk sync data ke server
- Pastikan port 3001 tidak digunakan oleh aplikasi lain
- Jika masih mendapat error 401, pastikan API key di `relay.js` sesuai dengan server

