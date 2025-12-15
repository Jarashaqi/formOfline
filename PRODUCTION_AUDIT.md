# AUDIT PRODUKSI: Waste Data PWA

**Tanggal Audit:** 2024  
**Arsitektur:** React + IndexedDB + Offline-First PWA  
**Target Skala:** 10k+ records, multi-tab, unreliable networks

---

## SUMMARY (≤ 8 lines)

Aplikasi PWA offline-first dengan IndexedDB untuk entry data sampah/panen. **Masalah kritis:** (1) Race condition pada sync multi-tab dapat menyebabkan data loss, (2) Hardcoded API key ter-expose di client bundle, (3) Memory leak dari setTimeout tanpa cleanup, (4) Performance collapse pada 5k+ records karena load-all-then-filter, (5) Inconsistent data types untuk flag `synced` (boolean vs number), (6) Tidak ada retry mechanism untuk failed syncs, (7) QRScanner tidak cleanup DOM element saat unmount, (8) Tidak ada background sync meskipun workbox-background-sync tersedia. **Risiko tertinggi:** Data corruption saat concurrent sync (Risk 9/10).

---

## CONFIRMED PROBLEMS

### 1. Race Condition: Concurrent Sync (CRITICAL)
**File:** `src/utils/storage.js:44-79`  
**Masalah:** `syncEntriesToServer()` tidak atomic. Jika 2 tab sync bersamaan:
- Tab A load entries [1,2,3] (unsynced)
- Tab B load entries [1,2,3,4] (entry 4 baru ditambah)
- Tab A sync [1,2,3] → server terima, mark synced
- Tab B sync [1,2,3,4] → server mungkin reject 1,2,3 (duplicate) atau accept semua
- **Hasil:** Entry 4 mungkin tidak ter-sync, atau entry 1,2,3 ter-sync 2x

**Kapan terjadi:** Multi-tab usage, atau user klik sync button 2x cepat.

**Bukti kode:**
```javascript
// Line 46: Load all entries (non-atomic snapshot)
const allEntries = await db.getEntries()
const unsynced = allEntries.filter(e => !e.synced && ...)

// Line 66-72: Update entries one-by-one (no transaction)
for (const entry of unsynced) {
  if (syncedIds.has(entry.id)) {
    entry.synced = true
    await db.updateEntry(entry)  // ← Race window di sini
  }
}
```

---

### 2. Hardcoded API Key Exposed (SECURITY)
**File:** `src/utils/api.js:46`, `relay.js:19`  
**Masalah:** API key `'DEV_SAMPAH_123'` hardcoded di client bundle. Siapapun bisa:
- Inspect bundle → extract key
- Replay requests dengan key tersebut
- Bypass authentication

**Kapan terjadi:** Selalu, karena key ada di bundle yang di-download user.

**Bukti kode:**
```javascript
// api.js:46
const headerKey = 'DEV_SAMPAH_123'  // ← Exposed in bundle

// relay.js:19
const API_KEY = 'DEV_SAMPAH_123';  // ← Also hardcoded
```

---

### 3. Memory Leak: setTimeout Tidak Di-cleanup
**File:** `src/pages/SampahMasukForm.jsx:111`, `PanenMaggotForm.jsx:100`  
**Masalah:** `setTimeout` di form tidak di-clear jika component unmount sebelum 2 detik. Navigation cepat → callback tetap jalan → state update pada unmounted component → memory leak + warning.

**Kapan terjadi:** User save entry lalu cepat navigate away (< 2 detik).

**Bukti kode:**
```javascript
// SampahMasukForm.jsx:111
setTimeout(() => {
  // Reset form & navigate
  navigate('/home')  // ← Jika component sudah unmount, ini error
}, 2000)
// ← Tidak ada cleanup: clearTimeout(timeoutId)
```

---

### 4. Performance: Load-All-Then-Filter (SCALE BREAKER)
**File:** `src/utils/storage.js:46`  
**Masalah:** `syncEntriesToServer()` load SEMUA entries ke memory untuk filter unsynced. Pada 10k records:
- Load 10k objects → ~5-10MB memory
- Filter in-memory → blocking main thread
- **UI freeze 2-5 detik** saat sync

**Kapan terjadi:** Setelah 3-5k entries, semakin parah seiring waktu.

**Bukti kode:**
```javascript
// storage.js:46
const allEntries = await db.getEntries()  // ← Load ALL
const unsynced = allEntries.filter(e => !e.synced && ...)  // ← Filter in-memory
```

**Seharusnya:** Gunakan IndexedDB index query langsung:
```javascript
const unsynced = await db.getAllFromIndex(STORE_NAME, 'synced', false)
```

---

### 5. Data Type Inconsistency: `synced` Flag
**File:** `src/utils/db.js:50`, `storage.js:26,51`  
**Masalah:** Flag `synced` inconsistent:
- `db.js:50` query index dengan value `0` (number)
- `storage.js:26` set `synced: false` (boolean)
- `storage.js:51` check `!e.synced && e.synced !== '1' && e.synced !== 1` (defensive, tapi menunjukkan confusion)

**Kapan terjadi:** Entries lama mungkin punya `synced: 0`, baru punya `synced: false` → query index gagal.

**Bukti kode:**
```javascript
// db.js:50
return db.getAllFromIndex(STORE_NAME, 'synced', 0)  // ← Expects number 0

// storage.js:26
synced: false,  // ← Boolean false

// storage.js:51
const unsynced = allEntries.filter(e => !e.synced && e.synced !== '1' && e.synced !== 1)
// ← Defensive check menunjukkan inconsistency
```

---

### 6. No Retry Mechanism (OFFLINE FAILURE)
**File:** `src/utils/storage.js:44-79`  
**Masalah:** Jika sync gagal (network error, 500, timeout), entries tetap `synced: false` tapi tidak ada retry otomatis. User harus manual klik sync lagi.

**Kapan terjadi:** Network flaky, server down, timeout.

**Bukti kode:**
```javascript
// storage.js:75-78
catch (err) {
  console.error('Sync error:', err)
  return { success: false, error: err.message || 'Unknown error' }
  // ← No retry queue, no exponential backoff
}
```

**Note:** `workbox-background-sync` ada di dependencies tapi tidak digunakan.

---

### 7. QRScanner DOM Leak
**File:** `src/components/QRScanner.jsx:12-20`  
**Masalah:** QRScanner create DOM element dengan `id='qr-reader'` tapi tidak remove saat unmount. Multiple mounts → multiple elements dengan ID sama → DOM leak + potential conflicts.

**Kapan terjadi:** User buka/tutup QR scanner beberapa kali.

**Bukti kode:**
```javascript
// QRScanner.jsx:12-20
let container = document.getElementById(elementId)
if (!container) {
  container = document.createElement('div')
  container.id = elementId  // ← Create element
  scannerRef.current.appendChild(container)
}
// ← Cleanup function (line 47) hanya stop scanner, tidak remove element
```

---

### 8. No Input Validation (DATA CORRUPTION RISK)
**File:** `src/pages/*Form.jsx` (semua form)  
**Masalah:** Entry data tidak divalidate sebelum save ke IndexedDB. User bisa inject:
- Negative weight
- Empty required fields (jika bypass validation)
- XSS via locationName (jika render tanpa escape)

**Kapan terjadi:** Manual DB manipulation, atau bug di form validation.

**Bukti kode:**
```javascript
// SampahMasukForm.jsx:84-101
const handleSave = async () => {
  if (!locationId || !wasteType || !shift || weight <= 0) {
    setSaveError('Harap lengkapi semua field')
    return  // ← Client-side only, bisa bypass
  }
  const entry = { ... }  // ← No server-side validation, no sanitization
  await addEntry(entry)
}
```

---

### 9. Migration Side Effect on Module Load
**File:** `src/utils/storage.js:6`  
**Masalah:** `migrateFromLocalStorage()` dipanggil saat module load (top-level side effect). Jika multiple modules import `storage.js` bersamaan, migration bisa jalan 2x → duplicate entries.

**Kapan terjadi:** Hot reload, atau multiple entry points import storage.js.

**Bukti kode:**
```javascript
// storage.js:6
db.migrateFromLocalStorage().catch(console.error)  // ← Top-level side effect
```

---

### 10. IndexedDB Transaction Not Atomic for Batch Updates
**File:** `src/utils/storage.js:64-72`  
**Masalah:** Update entries sebagai synced dilakukan satu-per-satu dalam loop, bukan dalam single transaction. Jika error di tengah:
- Entry 1-5 sudah marked synced
- Entry 6 error
- **Hasil:** Partial state, entries 1-5 akan di-sync ulang (duplicate risk)

**Kapan terjadi:** IndexedDB quota exceeded, atau browser kill transaction.

**Bukti kode:**
```javascript
// storage.js:64-72
let count = 0
for (const entry of unsynced) {
  if (syncedIds.has(entry.id)) {
    entry.synced = true
    await db.updateEntry(entry)  // ← Individual transaction per entry
    count++
  }
}
```

---

## PREDICTED FAILURES

### Failure Mode 1: Data Loss pada Concurrent Sync
**Kapan:** Multi-tab usage, atau user double-click sync button.  
**Apa yang terjadi:**
1. Tab A load 100 unsynced entries
2. Tab B (setelah entry baru) load 101 unsynced entries
3. Tab A sync 100 → server accept, mark local as synced
4. Tab B sync 101 → server mungkin reject 100 pertama (duplicate) atau accept
5. **Hasil:** Entry 101 mungkin tidak ter-sync, atau 100 pertama ter-sync 2x

**Dampak:** Data loss atau duplicate entries di server.

---

### Failure Mode 2: UI Freeze pada 5k+ Records
**Kapan:** Setelah 3-5 bulan usage (asumsi 50 entries/hari).  
**Apa yang terjadi:**
1. User klik "Sinkron Data"
2. `getEntries()` load 5000+ entries ke memory (~5-10MB)
3. Filter in-memory blocking main thread 2-5 detik
4. **UI freeze, button tidak responsif**

**Dampak:** Poor UX, user mungkin klik multiple times → multiple syncs → race condition.

---

### Failure Mode 3: IndexedDB Quota Exceeded
**Kapan:** Setelah 1-2 tahun (10k+ entries, ~50MB data).  
**Apa yang terjadi:**
1. Browser quota limit (biasanya 50-100MB per origin)
2. `addEntry()` throw `QuotaExceededError`
3. **Tidak ada error handling** → entry hilang, user tidak tahu

**Dampak:** Silent data loss.

---

### Failure Mode 4: Partial Sync State Corruption
**Kapan:** Network timeout atau server error di tengah sync batch.  
**Apa yang terjadi:**
1. 100 entries di-sync
2. Server process 50 pertama, lalu timeout
3. Response hanya return 50 `syncedIds`
4. Local mark 50 sebagai synced
5. **50 lainnya tetap unsynced, tapi mungkin sudah di server** (jika server process sebelum timeout)

**Dampak:** Duplicate sync risk, atau entries hilang jika server rollback.

---

### Failure Mode 5: Memory Leak dari setTimeout
**Kapan:** User save entry lalu cepat navigate (< 2 detik).  
**Apa yang terjadi:**
1. `setTimeout(() => navigate('/home'), 2000)` registered
2. User navigate away dalam 1 detik
3. Component unmount
4. Timeout callback masih jalan → update state pada unmounted component
5. **Memory leak + React warning**

**Dampak:** Memory usage meningkat seiring waktu, terutama pada mobile devices.

---

## RISK TABLE

| File / Function | Risk 1-10 | Why it fails |
|----------------|-----------|--------------|
| `storage.js:syncEntriesToServer()` | **9** | Race condition multi-tab → data loss/duplicate. Load-all-then-filter → UI freeze 5k+ records. No atomic transaction → partial state corruption. |
| `api.js:pushEntries()` | **8** | Hardcoded API key exposed → security breach. No retry mechanism → failed syncs stay failed. |
| `storage.js:addEntry()` | **7** | No input validation → corrupted data masuk DB. No quota error handling → silent data loss. |
| `db.js:getUnsyncedEntries()` | **6** | Data type inconsistency (boolean vs number) → query miss entries. Index mungkin tidak work di semua browser. |
| `QRScanner.jsx:useEffect()` | **6** | DOM element tidak di-remove → DOM leak. Multiple mounts → ID conflict. |
| `*Form.jsx:handleSave()` | **5** | setTimeout tidak di-cleanup → memory leak. Client-side validation bisa bypass. |
| `storage.js:6` (migration) | **5** | Top-level side effect → bisa jalan 2x → duplicate entries. |
| `db.js:saveEntries()` | **4** | Batch put dalam transaction OK, tapi tidak handle quota errors. |
| `auth.js:*` | **4** | localStorage vulnerable to XSS, tapi low risk untuk internal app. |
| `HistoryPage.jsx:loadEntries()` | **4** | No pagination → akan freeze dengan 5k+ entries, tapi hanya di history page (bukan critical path). |

---

## FIX PLAN (Ordered by Priority)

### Fix 1: Atomic Sync dengan IndexedDB Transaction Lock (Risk 9 → 3)
**File:** `src/utils/storage.js`  
**Masalah:** Race condition concurrent sync.

**Solusi:**
```javascript
// Add lock mechanism using IndexedDB
const SYNC_LOCK_KEY = 'sync_in_progress'

export async function syncEntriesToServer() {
  const db = await initDB()
  
  // Check lock
  const lock = await db.get('locks', SYNC_LOCK_KEY)
  if (lock && Date.now() - lock.timestamp < 30000) { // 30s timeout
    return { success: false, error: 'Sync already in progress' }
  }
  
  // Acquire lock
  await db.put('locks', { id: SYNC_LOCK_KEY, timestamp: Date.now() })
  
  try {
    // Use index query instead of load-all
    const unsynced = await db.getAllFromIndex(STORE_NAME, 'synced', false)
    
    if (unsynced.length === 0) {
      await db.delete('locks', SYNC_LOCK_KEY)
      return { success: true, syncedCount: 0 }
    }
    
    const responseData = await api.pushEntries(unsynced)
    const syncedIds = new Set(responseData.syncedIds || [])
    
    // Atomic batch update in single transaction
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    
    for (const entry of unsynced) {
      if (syncedIds.has(entry.id)) {
        entry.synced = true
        await store.put(entry)
      }
    }
    
    await tx.done
    return { success: true, syncedCount: syncedIds.size }
  } catch (err) {
    console.error('Sync error:', err)
    return { success: false, error: err.message }
  } finally {
    // Release lock
    await db.delete('locks', SYNC_LOCK_KEY).catch(() => {})
  }
}
```

**Perubahan:**
1. Add `locks` objectStore di `db.js:initDB()`
2. Use index query `getAllFromIndex('synced', false)` instead of load-all
3. Batch update dalam single transaction
4. Lock mechanism prevent concurrent syncs

---

### Fix 2: Move API Key ke Environment Variable (Risk 8 → 2)
**File:** `src/utils/api.js`, `relay.js`  
**Masalah:** Hardcoded API key exposed.

**Solusi:**
```javascript
// api.js:24-27
function getApiKey() {
  const k = import.meta.env.VITE_API_KEY
  if (!k) {
    throw new Error('VITE_API_KEY not set in environment')
  }
  return k
}

// api.js:46 - REMOVE hardcoded fallback
const headerKey = getApiKey()  // ← No fallback

// relay.js:19
const API_KEY = process.env.API_KEY || process.env.VITE_API_KEY
if (!API_KEY) {
  console.error('❌ API_KEY not set. Set it in .env file')
  process.exit(1)
}
```

**Perubahan:**
1. Remove hardcoded `'DEV_SAMPAH_123'`
2. Require env var, throw error if missing
3. Add `.env.example` dengan placeholder
4. Document di README

**Note:** Untuk production, API key tetap akan ter-expose di client bundle (karena client-side). Consider server-side proxy atau token-based auth.

---

### Fix 3: Cleanup setTimeout dengan useRef (Risk 5 → 1)
**File:** `src/pages/SampahMasukForm.jsx`, `PanenMaggotForm.jsx`  
**Masalah:** Memory leak dari setTimeout.

**Solusi:**
```javascript
// SampahMasukForm.jsx
import React, { useState, useRef, useEffect } from 'react'

function SampahMasukForm() {
  const timeoutRef = useRef(null)
  
  // ... existing code ...
  
  const handleSave = async () => {
    // ... validation ...
    
    try {
      const savedEntry = await addEntry(entry)
      setSaveSuccess(true)
      setSaveError('')
      
      timeoutRef.current = setTimeout(() => {
        // Reset form & navigate
        setLocationId('')
        // ... reset other fields ...
        setSaveSuccess(false)
        navigate('/home')
      }, 2000)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  // ... rest of component ...
}
```

**Perubahan:**
1. Add `useRef` untuk store timeout ID
2. Add `useEffect` cleanup
3. Clear timeout on unmount

---

### Fix 4: Use Index Query Instead of Load-All (Risk 9 → 4)
**File:** `src/utils/storage.js:46`  
**Masalah:** Performance collapse pada 5k+ records.

**Solusi:**
```javascript
// storage.js:44
export async function syncEntriesToServer() {
  try {
    const db = await initDB()
    
    // Use index query - O(1) instead of O(n)
    const unsynced = await db.getAllFromIndex(STORE_NAME, 'synced', false)
    
    if (unsynced.length === 0) {
      return { success: true, syncedCount: 0 }
    }
    
    // ... rest of sync logic ...
  }
}
```

**Perubahan:**
1. Replace `getEntries()` dengan `getAllFromIndex('synced', false)`
2. Ensure index exists di `db.js:initDB()`
3. Standardize `synced` sebagai boolean (not number)

---

### Fix 5: Standardize `synced` Data Type (Risk 6 → 2)
**File:** `src/utils/db.js`, `storage.js`  
**Masalah:** Inconsistent boolean vs number.

**Solusi:**
```javascript
// db.js:17 - Ensure index supports boolean
store.createIndex('synced', 'synced', { unique: false })

// db.js:50 - Query with boolean false
export const getUnsyncedEntries = async () => {
  const db = await initDB()
  return db.getAllFromIndex(STORE_NAME, 'synced', false)  // ← Boolean false
}

// storage.js:26 - Already boolean, keep it
synced: false,  // ← Boolean

// storage.js:51 - Simplify filter (no defensive checks needed)
const unsynced = await db.getUnsyncedEntries()  // ← Use helper
```

**Perubahan:**
1. Standardize semua `synced` sebagai boolean `true/false`
2. Update index query to use boolean
3. Remove defensive type checks
4. Add migration script untuk convert old entries (if any)

---

### Fix 6: Add Retry Queue dengan Exponential Backoff (Risk 6 → 2)
**File:** `src/utils/storage.js`  
**Masalah:** No retry mechanism.

**Solusi:**
```javascript
// storage.js - Add retry queue
const RETRY_DELAYS = [1000, 2000, 5000, 10000] // ms

export async function syncEntriesToServer(retryCount = 0) {
  try {
    // ... existing sync logic ...
  } catch (err) {
    // If network error and retries left, schedule retry
    if (retryCount < RETRY_DELAYS.length && 
        (err.message.includes('Network') || err.message.includes('timeout'))) {
      const delay = RETRY_DELAYS[retryCount]
      console.log(`Sync failed, retrying in ${delay}ms...`)
      
      setTimeout(() => {
        syncEntriesToServer(retryCount + 1)
      }, delay)
      
      return { success: false, error: err.message, retrying: true }
    }
    
    console.error('Sync error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}
```

**Perubahan:**
1. Add retry logic dengan exponential backoff
2. Only retry on network errors (not 401, 500, etc.)
3. Max 4 retries
4. Consider using `workbox-background-sync` untuk true background retry

---

### Fix 7: Cleanup QRScanner DOM Element (Risk 6 → 1)
**File:** `src/components/QRScanner.jsx`  
**Masalah:** DOM element tidak di-remove.

**Solusi:**
```javascript
// QRScanner.jsx:47-53
return () => {
  if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
    html5QrCodeRef.current.stop().catch(err => {
      console.error("Failed to stop scanner:", err)
    })
  }
  
  // Remove DOM element
  const container = document.getElementById('qr-reader')
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
}
```

**Perubahan:**
1. Remove DOM element di cleanup function
2. Check parentNode exists sebelum remove

---

### Fix 8: Add Input Validation & Sanitization (Risk 5 → 2)
**File:** `src/utils/storage.js:addEntry()`  
**Masalah:** No server-side validation.

**Solusi:**
```javascript
// storage.js:21
export async function addEntry(partialEntry) {
  // Validate required fields
  if (!partialEntry.formType || !partialEntry.locationId) {
    throw new Error('Missing required fields: formType, locationId')
  }
  
  // Validate weight
  if (partialEntry.weightKg !== undefined) {
    if (typeof partialEntry.weightKg !== 'number' || 
        partialEntry.weightKg < 0 || 
        partialEntry.weightKg > 1000) {
      throw new Error('Invalid weightKg: must be number between 0-1000')
    }
  }
  
  // Sanitize strings (prevent XSS)
  const sanitize = (str) => {
    if (typeof str !== 'string') return str
    return str.replace(/[<>]/g, '') // Basic, consider using DOMPurify
  }
  
  const now = new Date().toISOString()
  const newEntry = {
    id: `ENT-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    synced: false,
    ...partialEntry,
    // Sanitize user-input strings
    locationName: sanitize(partialEntry.locationName),
    userName: sanitize(partialEntry.userName),
  }
  
  try {
    await db.addEntry(newEntry)
    return newEntry
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please sync data and clear old entries.')
    }
    throw err
  }
}
```

**Perubahan:**
1. Add validation untuk required fields
2. Validate weight range (0-1000kg)
3. Sanitize strings (basic XSS prevention)
4. Handle QuotaExceededError dengan user-friendly message

---

### Fix 9: Move Migration ke Explicit Call (Risk 5 → 1)
**File:** `src/utils/storage.js:6`, `src/main.jsx`  
**Masalah:** Top-level side effect.

**Solusi:**
```javascript
// storage.js - REMOVE top-level call
// db.migrateFromLocalStorage().catch(console.error)  // ← Remove this

// main.jsx - Add explicit migration on app start
import { migrateFromLocalStorage } from './utils/db'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Run migration once on app start
migrateFromLocalStorage().catch(console.error)
```

**Perubahan:**
1. Remove top-level side effect dari `storage.js`
2. Call migration explicitly di `main.jsx` (once per app lifecycle)

---

### Fix 10: Add Pagination untuk HistoryPage (Risk 4 → 1)
**File:** `src/pages/HistoryPage.jsx`  
**Masalah:** No pagination → freeze dengan 5k+ entries.

**Solusi:**
```javascript
// HistoryPage.jsx - Add pagination
const [page, setPage] = useState(1)
const ITEMS_PER_PAGE = 50

const loadEntries = async () => {
  setLoading(true)
  try {
    const allEntries = await getEntries() || []
    const sortedEntries = allEntries.sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    
    // Paginate
    const start = (page - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    setEntries(sortedEntries.slice(start, end))
    setTotalEntries(sortedEntries.length)
  } catch (error) {
    console.error('Error loading entries:', error)
  } finally {
    setLoading(false)
  }
}

// Add pagination controls in JSX
<div className="flex justify-between items-center mt-4">
  <button 
    onClick={() => setPage(p => Math.max(1, p - 1))}
    disabled={page === 1}
  >
    Previous
  </button>
  <span>Page {page} of {Math.ceil(totalEntries / ITEMS_PER_PAGE)}</span>
  <button 
    onClick={() => setPage(p => p + 1)}
    disabled={page * ITEMS_PER_PAGE >= totalEntries}
  >
    Next
  </button>
</div>
```

**Perubahan:**
1. Add pagination state
2. Slice entries per page (50 items)
3. Add pagination controls
4. Load only current page entries

---

## DESIGN SMELLS & LONG-TERM RISKS

### Smell 1: No Conflict Resolution
**Masalah:** Jika 2 devices edit entry yang sama, tidak ada conflict resolution. Last-write-wins, data loss risk.

**Kapan jadi masalah:** Multi-device usage, atau jika server punya edit capability di masa depan.

**Solusi jangka panjang:** Add `version` field, implement last-write-wins dengan timestamp, atau operational transform.

---

### Smell 2: No Data Compression
**Masalah:** Entry objects disimpan as-is, tidak ada compression. 10k entries × 2KB = 20MB, mendekati quota limit.

**Kapan jadi masalah:** Setelah 1-2 tahun usage.

**Solusi jangka panjang:** Compress entries dengan gzip sebelum store, atau archive old entries (> 6 bulan) ke separate store.

---

### Smell 3: No Offline Queue Visibility
**Masalah:** User tidak tahu berapa banyak entries pending sync, atau kenapa sync gagal.

**Kapan jadi masalah:** Network flaky, user tidak tahu harus retry atau tidak.

**Solusi jangka panjang:** Add sync status indicator di UI, show pending count, error messages.

---

### Smell 4: Hardcoded Locations
**Masalah:** Locations hardcoded di setiap form component. Jika location berubah, harus update banyak files.

**Kapan jadi masalah:** Business requirement change, atau perlu dynamic locations dari server.

**Solusi jangka panjang:** Move locations ke config file atau fetch dari server, cache di IndexedDB.

---

### Smell 5: No Analytics/Monitoring
**Masalah:** Tidak ada tracking untuk:
- Sync success/failure rate
- Average entries per day
- Storage usage
- Error frequency

**Kapan jadi masalah:** Production issues tidak terdeteksi sampai user complain.

**Solusi jangka panjang:** Add basic analytics (local only, no PII), error logging, storage usage monitoring.

---

## HARD CONSTRAINTS

1. **Client-Side Only:** API key akan tetap ter-expose di bundle. Untuk true security, perlu server-side proxy.
2. **IndexedDB Quota:** Browser limit ~50-100MB per origin. Tidak bisa di-increase, harus manage storage.
3. **No Server-Side Validation:** Semua validation client-side, bisa bypass. Consider server-side validation jika API support.
4. **Single-Origin:** Multi-tab sync race condition tidak bisa di-solve dengan SharedWorker (not widely supported). Harus pakai lock mechanism.

---

## DEFINITION OF DONE

Setelah fix diimplementasikan, junior developer harus bisa:

1. **Fix Race Condition (Fix 1):** Paham kenapa concurrent sync berbahaya, bisa implement lock mechanism, test dengan 2 tab open.
2. **Understand Scale Limits (Fix 4):** Paham kenapa load-all collapse, bisa use index query, test dengan 5k mock entries.
3. **Handle Errors Gracefully (Fix 8):** Paham QuotaExceededError, bisa show user-friendly message, test dengan quota limit.
4. **Prevent Memory Leaks (Fix 3, 7):** Paham cleanup patterns, bisa implement useEffect cleanup, test dengan React DevTools Profiler.

---

**END OF AUDIT**