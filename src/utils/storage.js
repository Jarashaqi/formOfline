// utils/storage.js
import * as db from './db'
import * as api from './api'

// Initialize or migrate on load (side effect, but useful ensures DB is ready)
db.migrateFromLocalStorage().catch(console.error)

/**
 * Returns all entries from IndexedDB.
 * Returns a Promise<Array>.
 */
export async function getEntries() {
  const entries = await db.getEntries()
  // Ensure we sort by newest first like before, though DB index helps
  return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Adds a new entry to IndexedDB.
 */
export async function addEntry(partialEntry) {
  const now = new Date().toISOString()
  const newEntry = {
    id: `ENT-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    synced: false, // 0 in some DB designs, but using boolean is fine for IDB
    ...partialEntry,
  }

  await db.addEntry(newEntry)
  return newEntry
}

export async function saveEntries(entries) {
  await db.saveEntries(entries)
}

/**
 * Syncs unsynced data to server.
 * 1. Find unsynced in DB
 * 2. POST to server
 * 3. Update DB with synced status
 */
export async function syncEntriesToServer() {
  try {
    const allEntries = await db.getEntries()
    // IDB doesn't always support boolean indexing across all browsers perfectly in older versions,
    // safe to filter in memory if list isn't huge.
    // Or use the db.getUnsyncedEntries helper if we implemented it robustly.
    // Let's filter manually to be safe for now:
    const unsynced = allEntries.filter(e => !e.synced && e.synced !== '1' && e.synced !== 1)

    if (unsynced.length === 0) {
      return { success: true, syncedCount: 0 }
    }

    // Call API
    const responseData = await api.pushEntries(unsynced)

    // Mark as synced
    const syncedIds = new Set(Array.isArray(responseData.syncedIds) ? responseData.syncedIds : [])

    // Update local DB
    // We only update the ones confirmed by server
    let count = 0
    for (const entry of unsynced) {
      if (syncedIds.has(entry.id)) {
        entry.synced = true
        await db.updateEntry(entry)
        count++
      }
    }

    return { success: true, syncedCount: count }
  } catch (err) {
    console.error('Sync error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}
