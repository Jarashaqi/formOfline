// utils/storage.js

const STORAGE_KEY = 'wasteapp_entries'

export function getEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error parsing entries from storage', e)
    return []
  }
}

export function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function addEntry(partialEntry) {
  const entries = getEntries()

  const now = new Date().toISOString()

  const newEntry = {
    id: `ENT-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    synced: false,
    ...partialEntry, // userName, formType, date, dll
  }

  entries.push(newEntry)
  saveEntries(entries)

  return newEntry
}
// ganti dengan URL shared hosting kamu
const API_BASE = 'https://dev.sekolahsampah.id/api';

export async function syncEntriesToServer() {
  const entries = getEntries()
  const unsynced = entries.filter(e => !e.synced)

  if (unsynced.length === 0) {
    return { success: true, syncedCount: 0 }
  }

  try {
    const res = await fetch(`${API_BASE}/sync.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // opsional: token simple biar nggak sembarang orang bisa post
        'X-API-KEY': 'SOME_SECRET_KEY',
      },
      body: JSON.stringify({ entries: unsynced }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `HTTP ${res.status}`)
    }

    const data = await res.json()
    if (!data.success) {
      throw new Error(data.message || 'Unknown error from server')
    }

    const syncedIds = new Set(data.syncedIds || [])

    const updated = entries.map(e =>
      syncedIds.has(e.id) ? { ...e, synced: true } : e
    )

    saveEntries(updated)

    return { success: true, syncedCount: syncedIds.size }
  } catch (err) {
    console.error('Sync error:', err)
    return { success: false, error: err.message }
  }
}
