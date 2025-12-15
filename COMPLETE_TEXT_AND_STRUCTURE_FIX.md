# COMPLETE TEXT STANDARDIZATION & FORM STRUCTURE FIX

## ✅ COMPLETED

Semua text labels, button texts, validation messages telah distandardisasi, dan semua form sesuai struktur requirement.

---

## PERUBAHAN UTAMA

### 1. **FORM BARU YANG DIBUAT**

#### `src/pages/InputPrepupaKoheiForm.jsx` (NEW)
- **Title**: "Input Prepupa ke Kohei"
- **Fields**:
  - a. Kode Tempat (dengan QR scanner + manual select)
  - b. Berat Prepupa (kg)
- **Form Type**: `input_prepupa_kohei`
- **Navigation**: Area Ayam

#### `src/pages/InputSampahKomposForm.jsx` (NEW)
- **Title**: "Input Sampah ke Kompos"
- **Fields**:
  - a. Berat Sampah (kg)
- **Form Type**: `input_sampah_kompos`
- **Navigation**: Area Sampah

#### `src/pages/InputSampahResiduForm.jsx` (NEW)
- **Title**: "Input Sampah Residu"
- **Fields**:
  - a. Berat Sampah (kg)
- **Form Type**: `input_sampah_residu`
- **Navigation**: Area Sampah

#### `src/pages/TelurMaggotForm.jsx` (NEW)
- **Title**: "Telur Maggot"
- **Fields**:
  - a. Berat Telur (kg)
  - b. Tanggal (otomatis terisi, read-only)
- **Form Type**: `telur_maggot`
- **Navigation**: Area Maggot

### 2. **FORM YANG SUDAH ADA - TEXT STANDARDIZED**

#### `src/pages/SampahMasukForm.jsx`
- ✅ Title: "Input Sampah Masuk"
- ✅ Field: "Sampah Berasal Dari" (Kode Tempat)
- ✅ Field: "Berat Sampah (kg)"
- ✅ Button: "Simpan"
- ✅ Validation: Spesifik per field
- **Note**: Form ini memiliki field tambahan (Jenis Sampah, Shift) yang sudah ada sebelumnya, tetap dipertahankan sesuai instruksi "keep it"

#### `src/pages/SampahTerpilahForm.jsx`
- ✅ Title: "Input Sampah Terpilah ke POC"
- ✅ Field: "Kode Tempat POC"
- ✅ Field: "Berat Sampah Organik (kg)" dan "Berat Sampah Non Organik (kg)"
- ✅ Button: "Simpan"
- ✅ Validation: Spesifik per field
- **Note**: Form ini memiliki field tambahan (Shift) yang sudah ada sebelumnya, tetap dipertahankan

#### `src/pages/PanenMaggotForm.jsx`
- ✅ Title: "Input Panen Maggot"
- ✅ Field: "Kode Tempat"
- ✅ Field: "Tipe Panen" (wajib, dengan select values)
- ✅ Field: "Berat Panen (kg)"
- ✅ Button: "Simpan"
- ✅ Validation: Spesifik per field

#### `src/pages/BsfPakanForm.jsx`
- ✅ Title: "Input Pakan Maggot"
- ✅ Field: "Kode Tempat"
- ✅ Field: "Berat Pakan (gram)"
- ✅ Button: "Simpan"
- ✅ Validation: Spesifik per field

#### `src/pages/PanenKasgotForm.jsx`
- ✅ Title: "Panen Kasgot"
- ✅ Field: "Kode Tempat"
- ✅ Field: "Berat Kasgot (kg)"
- ✅ Button: "Simpan"
- ✅ Validation: Spesifik per field

#### `src/pages/PanenKoheiForm.jsx`
- ✅ Title: "Panen Pupa dari Kohei"
- ✅ Field: "Berat Pupa (kg)"
- ✅ Button: "Simpan"
- ✅ Validation: Spesifik per field

#### `src/pages/TelurHarianForm.jsx`
- ✅ Title: "Panen Telur Harian"
- ✅ Field: "Tanggal" (otomatis terisi, dengan note)
- ✅ Field: "Berat Telur (kg)" (changed dari gram ke kg)
- ✅ Button: "Simpan"
- ✅ Validation: Spesifik per field

### 3. **NAVIGATION/MENU UPDATED**

#### `src/pages/AyamPage.jsx`
- ✅ Added menu: "Input Prepupa ke Kohei"
- ✅ Menu: "Panen Pupa dari Kohei" (existing)
- ✅ Button: "Kembali" (bukan "Home")

#### `src/pages/SampahPage.jsx`
- ✅ Added menu: "Input Sampah ke Kompos"
- ✅ Added menu: "Input Sampah Residu"
- ✅ Menu: "Input Sampah Terpilah ke POC" (updated text)
- ✅ Button: "Kembali" (bukan "Home")

#### `src/pages/BsfPage.jsx`
- ✅ Title: "Area Maggot" (bukan "Area BSF")
- ✅ Added menu: "Telur Maggot"
- ✅ Removed: "Pupuk dari Sisa Organik"
- ✅ Button: "Kembali" (bukan "Home")

### 4. **ROUTING UPDATED**

#### `src/App.jsx`
- ✅ Added route: `/input-prepupa-kohei`
- ✅ Added route: `/input-sampah-kompos`
- ✅ Added route: `/input-sampah-residu`
- ✅ Added route: `/telur-maggot`
- ✅ Removed route: `/sisa-organik-pupuk`

---

## FINAL FORM STRUCTURE MAP

### A. Form Area Ayam ✅

1. **Panen Telur Harian** ✓
   - a. Tanggal (otomatis terisi) ✓
   - b. Kandang bertelur (selection) ✓
   - c. Berat Telur (kg) ✓

2. **Input Prepupa ke Kohei** ✓ (NEW)
   - a. Kode Tempat ✓
   - b. Berat Prepupa (kg) ✓

3. **Panen Pupa dari Kohei** ✓
   - a. Berat Pupa (kg) ✓

### B. Form Area Sampah ✅

1. **Input Sampah Masuk** ✓
   - a. Sampah Berasal Dari (Kode Tempat) ✓
   - b. Berat Sampah (kg) ✓
   - *Note: Form juga memiliki field "Jenis Sampah" dan "Shift" yang sudah ada sebelumnya*

2. **Input Sampah Terpilah ke POC** ✓
   - a. Kode Tempat POC ✓
   - b. Berat Sampah Organik (kg) ✓
   - b. Berat Sampah Non Organik (kg) ✓
   - *Note: Form juga memiliki field "Shift" yang sudah ada sebelumnya*

3. **Input Sampah ke Kompos** ✓ (NEW)
   - a. Berat Sampah (kg) ✓

4. **Input Sampah Residu** ✓ (NEW)
   - a. Berat Sampah (kg) ✓

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

4. **Telur Maggot** ✓ (NEW)
   - a. Berat Telur (kg) ✓
   - b. Tanggal (otomatis terisi) ✓

---

## TERMINOLOGY STANDARDIZATION (FINAL)

### ✅ Consistent Terms Applied:
- **"Kode Tempat"** - digunakan di semua form (bukan "Lokasi", "Code Tempat", dll)
- **"Berat [item] (kg)"** atau **"Berat [item] (gram)"** - format konsisten untuk semua weight fields
- **"Tanggal"** dengan note "(otomatis terisi)" untuk auto-filled dates
- **"Input"** - untuk action verbs (Input Sampah Masuk, Input Panen Maggot, Input Prepupa ke Kohei)
- **"Simpan"** - untuk semua primary buttons
- **"Batal"** - untuk cancel buttons di forms
- **"Kembali"** - untuk back buttons di area pages

### ✅ Capitalization:
- **Title Case** untuk form titles
- **Sentence case** untuk helper text
- **Title Case** untuk button text

---

## VALIDATION MESSAGES (FINAL STANDARD)

**Pattern:**
```
[Field Name] wajib diisi
[Field Name] wajib diisi dan harus lebih dari 0
Minimal [requirement] wajib [action]
```

**Examples Applied:**
- "Kode Tempat wajib diisi"
- "Sampah Berasal Dari wajib diisi"
- "Tipe Panen wajib diisi"
- "Berat Sampah wajib diisi dan harus lebih dari 0"
- "Berat Prepupa wajib diisi dan harus lebih dari 0"
- "Berat Pupa wajib diisi dan harus lebih dari 0"
- "Berat Telur wajib diisi dan harus lebih dari 0"
- "Minimal satu kandang wajib ditandai bertelur"
- "Minimal salah satu berat sampah (organik atau non organik) wajib diisi dan harus lebih dari 0"

---

## FILES CREATED

1. `src/pages/InputPrepupaKoheiForm.jsx` - NEW
2. `src/pages/InputSampahKomposForm.jsx` - NEW
3. `src/pages/InputSampahResiduForm.jsx` - NEW
4. `src/pages/TelurMaggotForm.jsx` - NEW

## FILES MODIFIED

1. `src/App.jsx` - Added routes untuk new forms, removed pupuk route
2. `src/pages/AyamPage.jsx` - Added menu untuk Input Prepupa ke Kohei
3. `src/pages/SampahPage.jsx` - Added menus untuk Input Sampah ke Kompos dan Input Sampah Residu
4. `src/pages/BsfPage.jsx` - Added menu untuk Telur Maggot, updated title
5. `src/pages/HistoryPage.jsx` - Added form type labels untuk new forms
6. Semua form files - Text standardized (sudah dilakukan sebelumnya)

---

## NOTES

1. **Form Structure Compliance:**
   - Semua form sesuai struktur requirement
   - Form yang sudah ada tetap dipertahankan dengan field tambahan yang sudah ada sebelumnya (sesuai instruksi "keep it")
   - Form baru dibuat sesuai struktur requirement exact

2. **Tipe Panen di Input Panen Maggot:**
   - Field "Tipe Panen" sudah ada dan wajib
   - Menggunakan select dengan explicit values (Baby, pakan, pupa, prepupa)
   - Data bisa difilter berdasarkan tipe di database

3. **Tanggal Auto-filled:**
   - Telur Maggot: Tanggal otomatis terisi, read-only, dengan note "(otomatis terisi)"
   - Panen Telur Harian: Tanggal otomatis terisi, read-only, dengan note "(otomatis terisi)"

4. **SisaOrganikPupukForm.jsx:**
   - File masih ada di filesystem tapi tidak digunakan
   - Route dan menu entry sudah dihapus
   - Bisa dihapus manual jika diperlukan

---

*Complete standardization and structure fix: 2024*
*All forms created/updated, all text standardized, all navigation updated*
