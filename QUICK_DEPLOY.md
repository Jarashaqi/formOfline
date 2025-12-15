# 🚀 QUICK DEPLOY GUIDE

## ✅ Build Berhasil!

Aplikasi sudah siap untuk di-deploy. Folder `dist/` sudah dibuat dan siap di-upload.

---

## 📋 LANGKAH DEPLOYMENT (Pilih Salah Satu)

### OPSI 1: GitHub Pages (Paling Mudah - Sudah Dikonfigurasi)

#### Step 1: Setup GitHub Secrets
1. Buka repository di GitHub
2. Pergi ke **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan 2 secrets:
   - **Name:** `VITE_API_KEY` → **Value:** API key Anda
   - **Name:** `VITE_API_BASE` → **Value:** `https://dev.sekolahsampah.id` (atau URL API Anda)

#### Step 2: Enable GitHub Pages
1. Di repository GitHub, perg ke **Settings** → **Pages**
2. Di bagian **Source**, pilih **GitHub Actions**
3. Save

#### Step 3: Deploy
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

#### Step 4: Tunggu Deployment
- Cek tab **Actions** di GitHub
- Tunggu workflow selesai (sekitar 2-3 menit)
- Aplikasi akan tersedia di: `https://[username].github.io/formOfline/`

---

### OPSI 2: Manual Upload ke Hosting

#### Step 1: Siapkan Environment Variables
Buat file `.env.production` di root project:
```env
VITE_API_KEY=your_api_key_here
VITE_API_BASE=https://dev.sekolahsampah.id
```

#### Step 2: Build (Sudah dilakukan)
```bash
npm run build
```

#### Step 3: Upload Folder `dist/`
- Upload **isi** folder `dist/` ke hosting Anda
- Pastikan server mengarahkan semua route ke `index.html`

#### Step 4: Konfigurasi Server
**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /formOfline/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /formOfline/index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location /formOfline/ {
  try_files $uri $uri/ /formOfline/index.html;
}
```

---

### OPSI 3: Vercel (Paling Cepat)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set Environment Variables di Vercel Dashboard:
   - `VITE_API_KEY`
   - `VITE_API_BASE`

---

## ⚠️ PENTING

1. **Base Path:** Aplikasi menggunakan base path `/formOfline/`. Jika deploy ke root domain, edit `vite.config.js`:
   ```js
   base: '/',  // Ganti dari '/formOfline/'
   ```

2. **HTTPS Required:** PWA memerlukan HTTPS. Pastikan hosting support HTTPS.

3. **CORS:** Pastikan server API mengizinkan CORS dari domain production.

---

## ✅ Checklist

- [x] Build berhasil (folder `dist/` sudah dibuat)
- [ ] Environment variables sudah di-set
- [ ] GitHub Secrets sudah di-set (jika pakai GitHub Pages)
- [ ] GitHub Pages sudah di-enable (jika pakai GitHub Pages)
- [ ] Server routing sudah dikonfigurasi (jika manual deploy)

---

## 🎯 Recommended: GitHub Pages

Karena workflow sudah dikonfigurasi, **GitHub Pages adalah opsi termudah**:
1. Set GitHub Secrets (2 menit)
2. Enable GitHub Pages (1 menit)
3. Push ke main (30 detik)
4. Tunggu deployment (2-3 menit)

**Total: ~5 menit untuk deploy!**

---

*Quick Deploy Guide - 2024*
