# 🔧 FIX: MIME Type Error untuk Manual Hosting Upload

## ❌ Masalah

Error yang muncul saat upload langsung ke hosting:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html"
```

**Penyebab:** Server mengembalikan HTML (404 page) ketika browser mencoba load JavaScript files.

---

## 🔍 Diagnosa

### Pertanyaan Penting:
1. **Apakah Anda deploy ke root domain atau subfolder?**
   - Root: `https://yourdomain.com/`
   - Subfolder: `https://yourdomain.com/formOfline/`

2. **Struktur folder di hosting seperti apa?**
   - Apakah file di root `public_html/` atau di subfolder?

---

## ✅ SOLUSI BERDASARKAN SKENARIO

### SKENARIO 1: Deploy ke ROOT Domain (`https://yourdomain.com/`)

#### Step 1: Update Base Path ke Root

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

#### Step 3: Upload ke Hosting

- Upload **isi** folder `dist/` ke **root** hosting (biasanya `public_html/` atau `www/`)
- Struktur harus seperti ini:
  ```
  public_html/
    ├── index.html
    ├── assets/
    │   ├── index-793a390e.js
    │   ├── react-vendor-3c8011bb.js
    │   └── ...
    ├── manifest.json
    ├── manifest.webmanifest
    ├── registerSW.js
    ├── sw.js
    └── .nojekyll
  ```

#### Step 4: Konfigurasi Server

**Apache (.htaccess):**
Buat file `.htaccess` di root hosting:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Fix MIME types
<IfModule mod_mime.c>
  AddType application/javascript js
  AddType application/json json
  AddType application/manifest+json webmanifest
</IfModule>
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
  
  # Fix MIME types
  types {
    application/javascript js;
    application/json json;
    application/manifest+json webmanifest;
  }
}
```

---

### SKENARIO 2: Deploy ke SUBFOLDER (`https://yourdomain.com/formOfline/`)

#### Step 1: Pastikan Base Path Benar

Edit `vite.config.js` (sudah benar jika repo name = formOfline):
```js
export default defineConfig({
  base: '/formOfline/',  // Pastikan sesuai dengan folder name
  // ...
})
```

#### Step 2: Rebuild

```bash
npm run build
```

#### Step 3: Upload ke Subfolder

- Upload **isi** folder `dist/` ke subfolder `formOfline/` di hosting
- Struktur harus seperti ini:
  ```
  public_html/
    └── formOfline/
        ├── index.html
        ├── assets/
        │   ├── index-793a390e.js
        │   └── ...
        ├── manifest.json
        └── ...
  ```

#### Step 4: Konfigurasi Server untuk Subfolder

**Apache (.htaccess):**
Buat file `.htaccess` di folder `formOfline/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /formOfline/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /formOfline/index.html [L]
</IfModule>

# Fix MIME types
<IfModule mod_mime.c>
  AddType application/javascript js
  AddType application/json json
  AddType application/manifest+json webmanifest
</IfModule>
```

**Nginx:**
```nginx
location /formOfline/ {
  try_files $uri $uri/ /formOfline/index.html;
  
  # Fix MIME types
  types {
    application/javascript js;
    application/json json;
    application/manifest+json webmanifest;
  }
}
```

---

## 🛠️ LANGKAH PERBAIKAN CEPAT

### Jika Deploy ke Root:

1. **Update konfigurasi:**
   ```bash
   # Edit vite.config.js: base: '/'
   # Edit public/manifest.json: start_url: "/"
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Upload isi dist/ ke root hosting**

4. **Buat .htaccess di root** (copy dari panduan di atas)

5. **Test:**
   - Buka `https://yourdomain.com/`
   - Cek Network tab, pastikan file JS return `200 OK` dengan type `application/javascript`

### Jika Deploy ke Subfolder:

1. **Pastikan base path = `/formOfline/`** (sudah benar)

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Upload isi dist/ ke folder formOfline/**

4. **Buat .htaccess di folder formOfline/** (copy dari panduan di atas)

5. **Test:**
   - Buka `https://yourdomain.com/formOfline/`
   - Cek Network tab

---

## 🔍 VERIFIKASI

### Cek di Browser:

1. Buka aplikasi di browser
2. Buka **Developer Tools** (F12) → **Network** tab
3. Refresh page
4. Cek file-file JS:
   - **Status:** Harus `200 OK` (bukan `404`)
   - **Type:** Harus `application/javascript` (bukan `text/html`)
   - **Response:** Harus berisi JavaScript code (bukan HTML)

### Cek File di Server:

1. Akses langsung file JS di browser:
   - Root: `https://yourdomain.com/assets/index-793a390e.js`
   - Subfolder: `https://yourdomain.com/formOfline/assets/index-793a390e.js`
2. Harus return JavaScript code, bukan HTML 404 page

---

## 🐛 TROUBLESHOOTING

### File JS Masih Return HTML?

1. **Cek .htaccess:**
   - Pastikan file `.htaccess` ada di lokasi yang benar
   - Pastikan mod_rewrite enabled di Apache
   - Cek error log Apache jika ada

2. **Cek File Paths:**
   - Pastikan file JS benar-benar ada di server
   - Pastikan path di `index.html` sesuai dengan struktur folder

3. **Cek MIME Types:**
   - Pastikan server dikonfigurasi untuk serve `.js` sebagai `application/javascript`
   - Cek `.htaccess` atau konfigurasi Nginx

4. **Cek Base Path:**
   - Pastikan base path di `vite.config.js` sesuai dengan struktur folder
   - Root = `/`, Subfolder = `/formOfline/`

### Masih Blank Screen?

1. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R`
   - Atau buka Incognito window

2. **Cek Console Error:**
   - Buka Developer Tools → Console
   - Screenshot semua error

3. **Cek Network Tab:**
   - Cek file mana yang return 404 atau HTML
   - Screenshot Network tab

---

## 📋 CHECKLIST

- [ ] Base path sudah sesuai dengan struktur hosting (root atau subfolder)
- [ ] Rebuild sudah dilakukan setelah update base path
- [ ] File di-upload ke lokasi yang benar
- [ ] File `.htaccess` sudah dibuat dan dikonfigurasi
- [ ] MIME types sudah dikonfigurasi
- [ ] File JS bisa diakses langsung di browser (return JavaScript, bukan HTML)
- [ ] Browser cache sudah di-clear

---

*Hosting Deploy Fix - 2024*
