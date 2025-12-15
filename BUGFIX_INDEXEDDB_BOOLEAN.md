# BUGFIX: IndexedDB Boolean Index Query Error

## Error yang Terjadi

```
DataError: Failed to execute 'getAll' on 'IDBIndex': The parameter is not a valid key.
DataError: Failed to execute 'only' on 'IDBKeyRange': The parameter is not a valid key.
```

## Root Cause

**Masalah**: IndexedDB tidak support boolean (`true`/`false`) sebagai key range langsung untuk query operations seperti:
- `getAllFromIndex(store, index, false)` ❌
- `IDBKeyRange.only(false)` ❌

IndexedDB hanya support:
- Numbers
- Strings  
- Dates
- Arrays (dengan batasan)

Boolean values tidak bisa digunakan sebagai key range parameter.

## Solusi yang Diimplementasikan

### File: `src/utils/db.js` - Function `getUnsyncedEntries()`

**Before (Error)**:
```javascript
// ❌ Tidak bekerja - boolean tidak valid sebagai key
const entries = await db.getAllFromIndex(STORE_NAME, 'synced', false)
// atau
let cursor = await index.openCursor(IDBKeyRange.only(false))
```

**After (Fixed)**:
```javascript
// ✅ Menggunakan cursor untuk iterate melalui index
// Filter di JavaScript untuk entries dengan synced === false
let cursor = await index.openCursor()
while (cursor) {
    const entry = cursor.value
    if (entry.synced === false || entry.synced === 0 || entry.synced === '0' || 
        entry.synced === null || entry.synced === undefined) {
        entries.push(entry)
    }
    cursor = await cursor.continue()
}
```

## Penjelasan Teknis

1. **Cursor Approach**: 
   - Iterate melalui index menggunakan cursor
   - Filter entries di JavaScript (bukan di IndexedDB level)
   - Masih lebih efficient daripada `getAll()` karena kita iterate melalui index (sorted), bukan full object store scan

2. **Legacy Value Handling**:
   - Handle legacy values: `0`, `'0'`, `null`, `undefined` (dari migration)
   - Ensure compatibility dengan data lama

3. **Fallback**:
   - Jika index tidak ada, fallback ke `getAll()` + filter
   - Error handling untuk prevent crash

## Performance Impact

- **Before**: Error, tidak bisa query
- **After**: 
  - Cursor iteration: O(n) dimana n = jumlah entries di index
  - Masih lebih efficient daripada `getAll()` karena kita iterate index (sorted), bukan full object store
  - Untuk 10k entries: ~100ms (estimated)

## Testing

Error sudah fixed. Test dengan:
1. Buka HistoryPage
2. Verify tidak ada error di console
3. Verify pending count muncul dengan benar
4. Verify sync tetap bekerja

## Catatan

Untuk optimasi lebih lanjut di masa depan, pertimbangkan:
- Menggunakan number index (0/1) instead of boolean untuk better query support
- Atau menggunakan composite index dengan field lain

---

*Bug fixed: 2024*
*Error resolved: IndexedDB boolean index query*
