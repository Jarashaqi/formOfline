# 🚀 PANDUAN DEPLOYMENT KE WEBSITE

## ✅ Persiapan Sebelum Deploy

### 1. **Environment Variables**

Aplikasi memerlukan environment variables untuk API. Buat file `.env.production` di root project:

```env
VITE_API_KEY=your_api_key_here
VITE_API_BASE=https://dev.sekolahsampah.id
```

**PENTING:**
- Jangan commit file `.env.production` ke Git (sudah ada di `.gitignore`)
- Untuk GitHub Pages, kita perlu set environment variables di GitHub Secrets

### 2. **GitHub Secrets Setup**

1. Buka repository di GitHub
2. Pergi ke **Settings** → **Secrets and variables** → **Actions**
3. Tambahkan secrets berikut:
   - `VITE_API_KEY` = API key Anda
   - `VITE_API_BASE` = Base URL API (contoh: `https://dev.sekolahsampah.id`)

### 3. **Update GitHub Actions Workflow**

File `.github/workflows/deploy.yml` sudah ada, tapi perlu ditambahkan environment variables:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
    VITE_API_BASE: ${{ secrets.VITE_API_BASE }}
```

---

## 📦 OPSI DEPLOYMENT

### OPSI 1: GitHub Pages (Recommended - Sudah Dikonfigurasi)

#### Langkah-langkah:

1. **Enable GitHub Pages:**
   - Buka repository → **Settings** → **Pages**
   - Source: **GitHub Actions**
   - Save

2. **Update Workflow untuk Include Environment Variables:**

   Edit `.github/workflows/deploy.yml`:

   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
       VITE_API_BASE: ${{ secrets.VITE_API_BASE }}
   ```

3. **Push ke Main Branch:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

4. **Deploy Otomatis:**
   - GitHub Actions akan otomatis build dan deploy
   - Cek status di tab **Actions**
   - Setelah selesai, aplikasi akan tersedia di:
     `https://[username].github.io/formOfline/`

---

### OPSI 2: Manual Build & Deploy

#### Langkah-langkah:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Buat File `.env.production`:**
   ```env
   VITE_API_KEY=your_api_key_here
   VITE_API_BASE=https://dev.sekolahsampah.id
   ```

3. **Build untuk Production:**
   ```bash
   npm run build
   ```

4. **Preview Build (Optional):**
   ```bash
   npm run preview
   ```

5. **Deploy Folder `dist/`:**
   - Upload isi folder `dist/` ke hosting Anda
   - Pastikan server mengarahkan semua route ke `index.html` (untuk React Router)
   - Pastikan base path sesuai dengan konfigurasi (`/formOfline/`)

---

### OPSI 3: Deploy ke Vercel/Netlify

#### Vercel:

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

#### Netlify:

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. Set Environment Variables di Netlify Dashboard

---

## 🔧 Konfigurasi Server (Jika Manual Deploy)

### Apache (.htaccess):

Buat file `.htaccess` di folder `dist/`:

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

### Nginx:

```nginx
location /formOfline/ {
  try_files $uri $uri/ /formOfline/index.html;
}
```

---

## ✅ Checklist Sebelum Deploy

- [ ] Environment variables sudah di-set (`VITE_API_KEY`, `VITE_API_BASE`)
- [ ] Build berhasil tanpa error (`npm run build`)
- [ ] Preview build berfungsi (`npm run preview`)
- [ ] PWA manifest sudah benar
- [ ] Base path sesuai dengan hosting (`/formOfline/` di vite.config.js)
- [ ] GitHub Secrets sudah di-set (jika pakai GitHub Pages)
- [ ] GitHub Pages sudah di-enable (jika pakai GitHub Pages)

---

## 🐛 Troubleshooting

### Build Error:
```bash
# Clear cache dan rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Tidak Terbaca:
- Pastikan file `.env.production` ada di root project
- Pastikan variable dimulai dengan `VITE_`
- Restart dev server setelah menambah environment variable

### Routing Tidak Bekerja:
- Pastikan server mengarahkan semua route ke `index.html`
- Pastikan base path sesuai (`/formOfline/`)

### PWA Tidak Install:
- Pastikan HTTPS enabled (PWA requires HTTPS)
- Cek manifest.json dan service worker
- Cek browser console untuk error

---

## 📝 Catatan Penting

1. **Base Path:** Aplikasi dikonfigurasi dengan base path `/formOfline/`. Jika deploy ke root domain, ubah di `vite.config.js`:
   ```js
   base: '/',  // Ganti dari '/formOfline/'
   ```

2. **API CORS:** Pastikan server API mengizinkan CORS dari domain production Anda.

3. **HTTPS:** PWA memerlukan HTTPS. Pastikan hosting Anda support HTTPS.

4. **Service Worker:** PWA akan auto-update via service worker. Pastikan cache strategy sesuai kebutuhan.

---

## 🎯 Quick Deploy (GitHub Pages)

```bash
# 1. Set GitHub Secrets (via GitHub UI)
# 2. Enable GitHub Pages (via GitHub UI)
# 3. Push ke main branch
git add .
git commit -m "Deploy to production"
git push origin main

# 4. Cek deployment di tab Actions
# 5. Aplikasi akan tersedia di: https://[username].github.io/formOfline/
```

---

*Deployment Guide - 2024*
