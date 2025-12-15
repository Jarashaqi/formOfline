# FINAL TEXT STANDARDIZATION - Daftar Perubahan

## ✅ COMPLETED

Semua text labels, button texts, validation messages, dan navigation text telah distandardisasi ke Indonesian yang formal, jelas, dan konsisten.

---

## RINGKASAN PERUBAHAN

### 1. FORM REMOVED
- ❌ **"Pupuk dari Sisa Organik"** - Removed dari Area Maggot
  - Removed dari `src/App.jsx` (route)
  - Removed dari `src/pages/BsfPage.jsx` (menu)

### 2. FORM TITLES UPDATED

| File | Before | After |
|------|--------|-------|
| `SampahMasukForm.jsx` | "Sampah Masuk" | "Input Sampah Masuk" |
| `SampahTerpilahForm.jsx` | "Sampah Terpilah" | "Input Sampah Terpilah ke POC" |
| `PanenMaggotForm.jsx` | "Panen Maggot" | "Input Panen Maggot" |
| `BsfPakanForm.jsx` | "Pakan BSF (Organik)" | "Input Pakan Maggot" |
| `PanenKoheiForm.jsx` | "Panen Kohei Ayam" | "Panen Pupa dari Kohei" |

### 3. FIELD LABELS STANDARDIZED

**"Kode Tempat" (konsisten di semua form):**
- `SampahMasukForm.jsx`: "Lokasi" → "Sampah Berasal Dari"
- `SampahTerpilahForm.jsx`: "Lokasi" → "Kode Tempat POC"
- `PanenMaggotForm.jsx`: "Lokasi" → "Kode Tempat"
- `BsfPakanForm.jsx`: "Box / Tray BSF" → "Kode Tempat"
- `PanenKasgotForm.jsx`: "Dari mana (bed/box/lokasi)" → "Kode Tempat"

**"Berat" fields (konsisten format):**
- `SampahMasukForm.jsx`: "Berat (kg)" → "Berat Sampah (kg)"
- `SampahTerpilahForm.jsx`: "Berat Organik" → "Berat Sampah Organik (kg)", "Berat Non Organik" → "Berat Sampah Non Organik (kg)"
- `PanenKoheiForm.jsx`: "Berat Kohei (kg)" → "Berat Pupa (kg)"
- `TelurHarianForm.jsx`: "Total Berat Telur (gram)" → "Berat Telur (kg)" (changed input dari gram ke kg)

### 4. BUTTON TEXTS STANDARDIZED

**Primary Buttons:**
- Semua form: "SIMPAN [TEXT]" → "Simpan"
- Examples:
  - "SIMPAN ENTRI" → "Simpan"
  - "SIMPAN PANEN TELUR" → "Simpan"
  - "SIMPAN PANEN KOHEI" → "Simpan"
  - "SIMPAN SAMPAH TERPILAH" → "Simpan"
  - "SIMPAN ENTRI PANEN" → "Simpan"
  - "SIMPAN PAKAN BSF" → "Simpan"
  - "SIMPAN PANEN KASGOT" → "Simpan"

**Secondary Buttons:**
- Form pages: "Batal" (konsisten)
- Area pages: "Kembali" (konsisten)
- Changed: "Home" → "Kembali" di area pages

### 5. VALIDATION MESSAGES STANDARDIZED

**Pattern: `[Field Name] wajib diisi` atau `[Field Name] wajib diisi dan harus lebih dari 0`**

| File | Before | After |
|------|--------|-------|
| `SampahMasukForm.jsx` | "Harap lengkapi semua field" | Spesifik per field: "Sampah Berasal Dari wajib diisi", "Jenis Sampah wajib diisi", "Shift wajib diisi", "Berat Sampah wajib diisi dan harus lebih dari 0" |
| `SampahTerpilahForm.jsx` | "Harap pilih lokasi dan shift" | "Kode Tempat POC wajib diisi", "Shift wajib diisi", "Minimal salah satu berat sampah (organik atau non organik) wajib diisi dan harus lebih dari 0" |
| `PanenMaggotForm.jsx` | "Harap pilih lokasi, tipe panen, dan atur berat panen" | "Kode Tempat wajib diisi", "Tipe Panen wajib diisi", "Berat Panen wajib diisi dan harus lebih dari 0" |
| `BsfPakanForm.jsx` | "Harap pilih box BSF yang diberi makan" | "Kode Tempat wajib diisi", "Berat Pakan wajib diisi dan harus lebih dari 0" |
| `PanenKasgotForm.jsx` | "Harap isi sumber kasgot (dari mana)" | "Kode Tempat wajib diisi", "Berat Kasgot wajib diisi dan harus lebih dari 0" |
| `PanenKoheiForm.jsx` | "Berat kohei harus lebih dari 0 kg" | "Berat Pupa wajib diisi dan harus lebih dari 0" |
| `TelurHarianForm.jsx` | "Belum ada kandang yang ditandai bertelur" | "Minimal satu kandang wajib ditandai bertelur", "Berat Telur wajib diisi dan harus lebih dari 0" |

### 6. QR SCANNER & SELECT PLACEHOLDERS

**QR Scanner Button:**
- "🔍 Scan QR Lokasi" → "Scan QR Kode Tempat" (semua form)

**Select Placeholder:**
- "Pilih lokasi..." → "Pilih Kode Tempat..." (semua form)

**Success Message:**
- "Lokasi Terpilih:" → "Kode Tempat Terpilih:" (semua form)

**Error Message:**
- "Lokasi tidak ditemukan:" → "Kode Tempat tidak ditemukan:" (semua form)

### 7. NAVIGATION/MENU TEXT UPDATED

**HomePage:**
- "Pilih area kerja" → "Pilih area untuk catat data"
- "History Entri Detail" → "Riwayat Entri"
- "Buka History" → "Lihat Riwayat"

**AyamPage:**
- Subtitle: "Pantau panen telur harian" → "Catat data panen telur dan kohei"
- Menu: "Panen Kohei Ayam" → "Panen Pupa dari Kohei"
- Button: "Home" → "Kembali"

**SampahPage:**
- Subtitle: "Pantau sampah masuk & terpilah" → "Catat data sampah masuk, terpilah, kompos, dan residu"
- Menu: "Input Sampah Terpilah" → "Input Sampah Terpilah ke POC"
- Button: "Home" → "Kembali"

**BsfPage:**
- Title: "Area BSF" → "Area Maggot"
- Subtitle: "Pantau panen maggot & siklus BSF" → "Catat data panen maggot, pakan, kasgot, dan telur maggot"
- Menu: "Input Pakan BSF (Organik)" → "Input Pakan Maggot"
- Removed: "Pupuk dari Sisa Organik"
- Button: "Home" → "Kembali"

### 8. HELPER TEXT & PLACEHOLDERS

**Placeholders:**
- `PanenKasgotForm.jsx`: "Contoh: Bed Kompos 1, Box BSF 03" → "Contoh: BED-01, BOX-BSF-03"

**Helper Text:**
- `TelurHarianForm.jsx`: Added "(otomatis terisi)" untuk tanggal field
- `TelurHarianForm.jsx`: Changed weight input helper dari "Step: X gram" ke "Masukkan berat dalam kilogram (kg)"

### 9. TECHNICAL CHANGES

**TelurHarianForm.jsx:**
- Changed weight input dari gram ke kg
- User memasukkan dalam kg (bukan gram)
- Disimpan dalam gram (untuk kompatibilitas) dan juga dalam kg
- Removed unused `WEIGHT_STEP` constant

---

## FORM STRUCTURE FINAL MAP

### A. Form Area Ayam ✅
1. **Panen Telur Harian** ✓
   - a. Tanggal (otomatis terisi) ✓
   - b. Kandang bertelur (selection) ✓
   - c. Berat Telur (kg) ✓

2. **Panen Pupa dari Kohei** ✓
   - a. Berat Pupa (kg) ✓

### B. Form Area Sampah ✅
1. **Input Sampah Masuk** ✓
   - a. Sampah Berasal Dari (Kode Tempat) ✓
   - b. Jenis Sampah ✓
   - c. Shift ✓
   - d. Berat Sampah (kg) ✓

2. **Input Sampah Terpilah ke POC** ✓
   - a. Kode Tempat POC ✓
   - b. Shift ✓
   - c. Berat Sampah Organik (kg) ✓
   - d. Berat Sampah Non Organik (kg) ✓

### C. Form Area Maggot ✅
1. **Input Panen Maggot** ✓
   - a. Kode Tempat ✓
   - b. Tipe Panen (wajib) ✓
   - c. Berat Panen (kg) ✓

2. **Input Pakan Maggot** ✓
   - a. Kode Tempat ✓
   - b. Berat Pakan (gram) ✓

3. **Panen Kasgot** ✓
   - a. Kode Tempat ✓
   - b. Berat Kasgot (kg) ✓

---

## TERMINOLOGY STANDARDIZATION

### ✅ Consistent Terms Applied:
- **"Kode Tempat"** - digunakan di semua form (bukan "Lokasi", "Code Tempat", dll)
- **"Berat [item] (kg)"** - format konsisten untuk semua weight fields
- **"Tanggal"** dengan note "(otomatis terisi)" untuk auto-filled dates
- **"Input"** - untuk action verbs (Input Sampah Masuk, Input Panen Maggot)
- **"Simpan"** - untuk semua primary buttons
- **"Batal"** - untuk cancel buttons di forms
- **"Kembali"** - untuk back buttons di area pages

### ✅ Capitalization:
- **Title Case** untuk form titles
- **Sentence case** untuk helper text
- **Title Case** untuk button text

---

## FILES MODIFIED

1. `src/App.jsx` - Removed SisaOrganikPupukForm route
2. `src/pages/HomePage.jsx` - Updated navigation text
3. `src/pages/AyamPage.jsx` - Updated menu and navigation
4. `src/pages/SampahPage.jsx` - Updated menu and navigation
5. `src/pages/BsfPage.jsx` - Updated title, menu, removed pupuk form
6. `src/pages/SampahMasukForm.jsx` - Standardized all text
7. `src/pages/SampahTerpilahForm.jsx` - Standardized all text
8. `src/pages/PanenMaggotForm.jsx` - Standardized all text
9. `src/pages/BsfPakanForm.jsx` - Standardized all text
10. `src/pages/PanenKasgotForm.jsx` - Standardized all text
11. `src/pages/PanenKoheiForm.jsx` - Standardized all text
12. `src/pages/TelurHarianForm.jsx` - Standardized all text, changed weight input to kg
13. `src/pages/HistoryPage.jsx` - Updated form type labels

---

## NOTES

1. **Missing Forms (Not Created):**
   - Input Prepupa ke Kohei (Area Ayam)
   - Input Sampah ke Kompos (Area Sampah)
   - Input Sampah Residu (Area Sampah)
   - Telur Maggot (Area Maggot)

   Forms ini bisa dibuat nanti jika diperlukan, mengikuti struktur dan standardisasi yang sama.

2. **SisaOrganikPupukForm.jsx:**
   - File masih ada di filesystem tapi tidak digunakan
   - Bisa dihapus manual jika diperlukan

---

*Standardization completed: 2024*
*All text labels, buttons, validation messages, dan navigation text telah distandardisasi ke Indonesian yang formal dan konsisten*
