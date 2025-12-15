# 🚨 QUICK FIX: MIME Type Error untuk Hosting Manual

## ❌ Masalah Anda

Error saat upload langsung ke hosting:
- Blank screen (putih hitam)
- Error MIME type di console
- File JS return HTML bukan JavaScript

---

## ✅ SOLUSI CEPAT (Pilih Sesuai Hosting Anda)

### SKENARIO A: Deploy ke ROOT Domain (`https://yourdomain.com/`)

#### Step 1: Update Base Path

Edit `vite.config.js`:
```js
export default defineConfig({
  base: '/',  // Ganti dari '/formOfline/'
  // ...
  manifest: {
    // ...
    start_url: '/',
    scope: '/',
  }
})
```

Edit `public/manifest.json`:
```json
{
  "start_url": "/",
  "icons": [
    {
      "src": "/pwa-192x192.png",  // Hapus /formOfline/
      // ...
    }
  ]
}
```

#### Step 2: Rebuild

```bash
npm run build
```

#### Step 3: Upload & Konfigurasi

1. **Upload isi folder `dist/` ke ROOT hosting** (biasanya `public_html/` atau `www/`)

2. **Gunakan file `.htaccess.root`:**
   - Copy file `dist/.htaccess.root` 
   - Rename menjadi `.htaccess`
   - Upload ke root hosting

3. **Struktur harus seperti ini:**
   ```
   public_html/
     ├── .htaccess          (dari .htaccess.root)
     ├── index.html
     ├── assets/
     │   ├── index-793a390e.js
     │   └── ...
     ├── manifest.json
     └── ...
   ```

---

### SKENARIO B: Deploy ke SUBFOLDER (`https://yourdomain.com/formOfline/`)

#### Step 1: Pastikan Base Path Benar

Base path sudah benar (`/formOfline/`), tidak perlu diubah.

#### Step 2: Rebuild

```bash
npm run build
```

#### Step 3: Upload & Konfigurasi

1. **Upload isi folder `dist/` ke folder `formOfline/` di hosting**

2. **Gunakan file `.htaccess` yang sudah ada:**
   - File `dist/.htaccess` sudah dikonfigurasi untuk subfolder
   - Pastikan file ini ikut ter-upload

3. **Struktur harus seperti ini:**
   ```
   public_html/
     └── formOfline/
         ├── .htaccess      (sudah ada di dist/)
         ├── index.html
         ├── assets/
         │   ├── index-793a390e.js
         │   └── ...
         ├── manifest.json
         └── ...
   ```

---

## 🔍 VERIFIKASI

### Test di Browser:

1. Buka aplikasi:
   - Root: `https://yourdomain.com/`
   - Subfolder: `https://yourdomain.com/formOfline/`

2. Buka **Developer Tools** (F12) → **Network** tab

3. Refresh page

4. Cek file JS (index-*.js, react-vendor-*.js):
   - **Status:** Harus `200 OK` ✅
   - **Type:** Harus `application/javascript` ✅ (BUKAN `text/html` ❌)
   - **Response:** Harus berisi JavaScript code ✅ (BUKAN HTML ❌)

### Test File Langsung:

Coba akses file JS langsung di browser:
- Root: `https://yourdomain.com/assets/index-793a390e.js`
- Subfolder: `https://yourdomain.com/formOfline/assets/index-793a390e.js`

**Harus return JavaScript code, bukan HTML 404 page!**

---

## 🐛 TROUBLESHOOTING

### Masih Blank Screen?

1. **Cek .htaccess:**
   - Pastikan file `.htaccess` ada di lokasi yang benar
   - Pastikan mod_rewrite enabled di Apache
   - Cek error log hosting jika ada

2. **Cek File Paths:**
   - Pastikan file JS benar-benar ada di server
   - Pastikan path di `index.html` sesuai dengan struktur folder
   - Cek apakah base path sesuai (root = `/`, subfolder = `/formOfline/`)

3. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)
   - Atau buka **Incognito/Private window**

4. **Cek Console Error:**
   - Buka Developer Tools → Console
   - Screenshot semua error
   - Cek Network tab untuk file yang error

### File JS Masih Return HTML?

1. **Cek MIME Types:**
   - Pastikan `.htaccess` berisi konfigurasi MIME types
   - Pastikan server support mod_mime

2. **Cek File Permissions:**
   - Pastikan file JS readable (chmod 644)
   - Pastikan folder assets readable (chmod 755)

3. **Cek Server Configuration:**
   - Jika pakai cPanel, cek Apache configuration
   - Pastikan mod_rewrite dan mod_mime enabled

---

## 📋 CHECKLIST CEPAT

- [ ] Base path sudah sesuai (root = `/` atau subfolder = `/formOfline/`)
- [ ] Rebuild sudah dilakukan
- [ ] File di-upload ke lokasi yang benar
- [ ] File `.htaccess` sudah ada dan dikonfigurasi
- [ ] File JS bisa diakses langsung (return JavaScript, bukan HTML)
- [ ] Browser cache sudah di-clear
- [ ] Network tab menunjukkan file JS return `200 OK` dengan type `application/javascript`

---

## 🎯 LANGKAH TERAKHIR

Setelah semua langkah di atas:

1. **Clear browser cache** (hard refresh)
2. **Test di Incognito window**
3. **Cek Network tab** - pastikan semua file JS load dengan benar
4. **Cek Console** - pastikan tidak ada error

Jika masih error, screenshot:
- Console error
- Network tab (file yang error)
- Struktur folder di hosting

---

*Quick Fix for Hosting - 2024*
