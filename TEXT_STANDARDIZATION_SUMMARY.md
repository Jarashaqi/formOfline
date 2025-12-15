# TEXT STANDARDIZATION SUMMARY

## Status: ✅ COMPLETED

Semua text labels, helper texts, section titles, button texts, placeholders, dan validation messages telah distandardisasi ke Indonesian yang formal, jelas, dan konsisten.

---

## PERUBAHAN UTAMA

### 1. **REMOVED: Form "Pupuk dari Sisa Organik"**
- ✅ Removed dari `src/App.jsx` (routing)
- ✅ Removed dari `src/pages/BsfPage.jsx` (menu entry)
- ✅ File `src/pages/SisaOrganikPupukForm.jsx` tetap ada tapi tidak digunakan (bisa dihapus manual jika perlu)

### 2. **STANDARDIZED: Form Titles**

**Before → After:**
- "Sampah Masuk" → "Input Sampah Masuk"
- "Sampah Terpilah" → "Input Sampah Terpilah ke POC"
- "Panen Maggot" → "Input Panen Maggot"
- "Pakan BSF (Organik)" → "Input Pakan Maggot"
- "Panen Kohei Ayam" → "Panen Pupa dari Kohei"
- "Panen Telur Harian" → "Panen Telur Harian" (unchanged, sudah benar)

### 3. **STANDARDIZED: Field Labels**

**Konsistensi "Kode Tempat":**
- Semua field lokasi sekarang menggunakan "Kode Tempat" (bukan "Lokasi")
- QR Scanner button: "Scan QR Kode Tempat"
- Select placeholder: "Pilih Kode Tempat..."
- Success message: "Kode Tempat Terpilih:"

**Konsistensi "Berat":**
- "Berat (kg)" → "Berat Sampah (kg)" (untuk sampah forms)
- "Berat Panen (kg)" (untuk panen forms)
- "Berat Telur (kg)" (untuk telur form)
- "Berat Pakan (gram)" (untuk pakan form)
- "Berat Kasgot (kg)" (untuk kasgot form)
- "Berat Pupa (kg)" (untuk kohei form)

**Field Labels Standardized:**
- "Sampah Berasal Dari" (untuk Input Sampah Masuk)
- "Kode Tempat POC" (untuk Input Sampah Terpilah ke POC)
- "Kode Tempat" (untuk semua form lainnya yang butuh lokasi)
- "Tipe Panen" (untuk Input Panen Maggot - wajib field)
- "Shift" (konsisten, tanpa emoji di label)

### 4. **STANDARDIZED: Button Texts**

**Primary Buttons:**
- Semua form sekarang menggunakan "Simpan" (bukan "SIMPAN ENTRI", "SIMPAN PANEN", dll)
- Konsisten: Title Case untuk button text

**Secondary Buttons:**
- "Batal" (untuk cancel/back di form pages)
- "Kembali" (untuk back di area pages)

### 5. **STANDARDIZED: Validation Messages**

**Format konsisten:**
- "[Field Name] wajib diisi" (untuk required fields)
- "[Field Name] wajib diisi dan harus lebih dari 0" (untuk numeric fields)
- Spesifik dan jelas, tidak generic

**Examples:**
- "Sampah Berasal Dari wajib diisi"
- "Kode Tempat wajib diisi"
- "Tipe Panen wajib diisi"
- "Berat Sampah wajib diisi dan harus lebih dari 0"
- "Minimal satu kandang wajib ditandai bertelur"

### 6. **STANDARDIZED: Navigation/Menu Text**

**HomePage:**
- "Pilih area kerja" → "Pilih area untuk catat data"
- "History Entri Detail" → "Riwayat Entri"
- "Buka History" → "Lihat Riwayat"

**Area Pages:**
- "Area BSF" → "Area Maggot"
- "Pantau panen maggot & siklus BSF" → "Catat data panen maggot, pakan, kasgot, dan telur maggot"
- "Input Pakan BSF (Organik)" → "Input Pakan Maggot"
- "Panen Kohei Ayam" → "Panen Pupa dari Kohei"
- "Home" → "Kembali" (untuk back buttons)

### 7. **STANDARDIZED: Helper Text & Placeholders**

**Placeholders:**
- "Pilih lokasi..." → "Pilih Kode Tempat..."
- "Contoh: Bed Kompos 1, Box BSF 03" → "Contoh: BED-01, BOX-BSF-03"

**Helper Text:**
- "atau pilih manual:" (konsisten)
- "Tanggal: [date] (otomatis terisi)" (untuk auto-filled dates)

---

## FILE-BY-FILE CHANGES

### `src/App.jsx`
- Removed import `SisaOrganikPupukForm`
- Removed route `/sisa-organik-pupuk`

### `src/pages/HomePage.jsx`
- Updated greeting text
- Updated history card text
- Updated button text

### `src/pages/AyamPage.jsx`
- Updated subtitle
- Updated menu item: "Panen Kohei Ayam" → "Panen Pupa dari Kohei"
- Updated back button: "Home" → "Kembali"

### `src/pages/SampahPage.jsx`
- Updated subtitle
- Updated menu item: "Input Sampah Terpilah" → "Input Sampah Terpilah ke POC"
- Updated back button: "Home" → "Kembali"

### `src/pages/BsfPage.jsx`
- Updated title: "Area BSF" → "Area Maggot"
- Updated subtitle
- Removed menu item: "Pupuk dari Sisa Organik"
- Updated menu item: "Input Pakan BSF (Organik)" → "Input Pakan Maggot"
- Updated back button: "Home" → "Kembali"

### `src/pages/SampahMasukForm.jsx`
- Updated title: "Sampah Masuk" → "Input Sampah Masuk"
- Updated field label: "Lokasi" → "Sampah Berasal Dari"
- Updated field label: "Berat (kg)" → "Berat Sampah (kg)"
- Updated QR button: "Scan QR Lokasi" → "Scan QR Kode Tempat"
- Updated select placeholder: "Pilih lokasi..." → "Pilih Kode Tempat..."
- Updated success message: "Kode Tempat Terpilih:"
- Updated validation messages (spesifik per field)
- Updated button: "SIMPAN ENTRI" → "Simpan"

### `src/pages/SampahTerpilahForm.jsx`
- Updated title: "Sampah Terpilah" → "Input Sampah Terpilah ke POC"
- Updated field label: "Lokasi" → "Kode Tempat POC"
- Updated field label: "Shift Pilah" → "Shift"
- Updated field labels: "Berat Organik" → "Berat Sampah Organik", "Berat Non Organik" → "Berat Sampah Non Organik"
- Updated QR button: "Scan QR Lokasi" → "Scan QR Kode Tempat"
- Updated select placeholder: "Pilih lokasi..." → "Pilih Kode Tempat..."
- Updated success message: "Kode Tempat Terpilih:"
- Updated validation messages (spesifik per field)
- Updated button: "SIMPAN SAMPAH TERPILAH" → "Simpan"

### `src/pages/PanenMaggotForm.jsx`
- Updated title: "Panen Maggot" → "Input Panen Maggot"
- Updated subtitle
- Updated field label: "Lokasi" → "Kode Tempat"
- Updated field label: "Tipe Panen" (sudah ada, tetap)
- Updated field label: "Berat Panen (kg)" (sudah benar)
- Updated QR button: "Scan QR Lokasi" → "Scan QR Kode Tempat"
- Updated select placeholder: "Pilih lokasi..." → "Pilih Kode Tempat..."
- Updated success message: "Kode Tempat Terpilih:"
- Updated validation messages (spesifik per field)
- Updated button: "SIMPAN ENTRI PANEN" → "Simpan"

### `src/pages/BsfPakanForm.jsx`
- Updated title: "Pakan BSF (Organik)" → "Input Pakan Maggot"
- Updated field label: "Box / Tray BSF" → "Kode Tempat"
- Updated field label: "Berat Pakan Organik (gram)" → "Berat Pakan (gram)"
- Updated validation messages (spesifik per field)
- Updated button: "SIMPAN PAKAN BSF" → "Simpan"
- Updated back button: "Kembali" → "Batal"

### `src/pages/PanenKasgotForm.jsx`
- Updated subtitle
- Updated field label: "Dari mana (bed/box/lokasi)" → "Kode Tempat"
- Updated placeholder: "Contoh: Bed Kompos 1, Box BSF 03" → "Contoh: BED-01, BOX-BSF-03"
- Updated field label: "Berat Kasgot (kg)" (sudah benar)
- Updated validation messages (spesifik per field)
- Updated button: "SIMPAN PANEN KASGOT" → "Simpan"
- Updated back button: "Kembali" → "Batal"

### `src/pages/PanenKoheiForm.jsx`
- Updated title: "Panen Kohei Ayam" → "Panen Pupa dari Kohei"
- Updated subtitle: "Catat panen pupuk kandang ayam" → "Catat berat pupa yang dipanen dari kohei"
- Updated field label: "Berat Kohei (kg)" → "Berat Pupa (kg)"
- Updated validation messages (spesifik per field)
- Updated button: "SIMPAN PANEN KOHEI" → "Simpan"

### `src/pages/TelurHarianForm.jsx`
- Updated subtitle
- Updated field label: "Total Berat Telur (gram)" → "Berat Telur (kg)"
- Changed input dari gram ke kg (user input dalam kg, disimpan juga dalam kg)
- Updated validation messages (spesifik per field)
- Updated button: "SIMPAN PANEN TELUR" → "Simpan"
- Added helper text: "Tanggal: [date] (otomatis terisi)"

### `src/pages/HistoryPage.jsx`
- Updated form type labels untuk consistency

---

## FORM STRUCTURE MAP (Final)

### A. Form Area Ayam
1. **Panen Telur Harian** ✓
   - a. Tanggal (otomatis terisi)
   - b. Kandang bertelur (selection)
   - c. Berat Telur (kg)

2. **Panen Pupa dari Kohei** ✓
   - a. Berat Pupa (kg)

### B. Form Area Sampah
1. **Input Sampah Masuk** ✓
   - a. Sampah Berasal Dari (Kode Tempat)
   - b. Jenis Sampah
   - c. Shift
   - d. Berat Sampah (kg)

2. **Input Sampah Terpilah ke POC** ✓
   - a. Kode Tempat POC
   - b. Shift
   - c. Berat Sampah Organik (kg)
   - d. Berat Sampah Non Organik (kg)

### C. Form Area Maggot
1. **Input Panen Maggot** ✓
   - a. Kode Tempat
   - b. Tipe Panen (wajib)
   - c. Berat Panen (kg)

2. **Input Pakan Maggot** ✓
   - a. Kode Tempat
   - b. Berat Pakan (gram)

3. **Panen Kasgot** ✓
   - a. Kode Tempat
   - b. Berat Kasgot (kg)

---

## TERMINOLOGY STANDARDIZATION

### Consistent Terms Applied:
- ✅ "Kode Tempat" (NOT "Lokasi", "Code Tempat", dll)
- ✅ "Berat (kg)" atau "Berat [item] (kg)" untuk semua weight fields
- ✅ "Tanggal" dengan note "(otomatis terisi)" jika auto-filled
- ✅ "Sampah Residu" (untuk future forms)
- ✅ "Input" untuk action verbs (Input Sampah Masuk, Input Panen Maggot)
- ✅ "Simpan" untuk semua primary buttons
- ✅ "Batal" untuk cancel buttons di forms
- ✅ "Kembali" untuk back buttons di area pages

### Capitalization:
- ✅ Title Case untuk form titles
- ✅ Sentence case untuk helper text
- ✅ Title Case untuk button text

---

## VALIDATION MESSAGES STANDARDIZATION

**Pattern:**
```
[Field Name] wajib diisi
[Field Name] wajib diisi dan harus lebih dari 0
Minimal [requirement] wajib [action]
```

**Examples:**
- "Sampah Berasal Dari wajib diisi"
- "Kode Tempat wajib diisi"
- "Tipe Panen wajib diisi"
- "Berat Sampah wajib diisi dan harus lebih dari 0"
- "Minimal satu kandang wajib ditandai bertelur"
- "Minimal salah satu berat sampah (organik atau non organik) wajib diisi dan harus lebih dari 0"

---

## NOTES

1. **Missing Forms (Not Created Yet):**
   - Input Prepupa ke Kohei (Area Ayam)
   - Input Sampah ke Kompos (Area Sampah)
   - Input Sampah Residu (Area Sampah)
   - Telur Maggot (Area Maggot)

   Forms ini bisa dibuat nanti jika diperlukan, mengikuti struktur yang sama.

2. **TelurHarianForm Weight Input:**
   - Changed dari gram input ke kg input
   - User memasukkan dalam kg
   - Disimpan dalam gram (untuk kompatibilitas) dan juga dalam kg

3. **PanenKoheiForm:**
   - Title changed untuk match requirement: "Panen Pupa dari Kohei"
   - Field label: "Berat Pupa (kg)"

---

*Standardization completed: 2024*
*All text labels, buttons, validation messages, dan navigation text telah distandardisasi ke Indonesian yang formal dan konsisten*
