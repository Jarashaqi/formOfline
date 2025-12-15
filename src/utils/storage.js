// utils/storage.js
import * as db from './db'
import * as api from './api'
import { acquireSyncLock, releaseSyncLock, waitForSyncLock, isSyncInProgress } from './sync-lock'
import { addToRetryQueue } from './retry'
import { handleQuotaError } from './quota'
import { sanitizeEntry, validateEntry } from './validation'

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
  // Validate entry
  const validation = validateEntry(partialEntry, partialEntry.formType)
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  // Sanitize entry
  const sanitized = sanitizeEntry(partialEntry)

  const now = new Date().toISOString()
  const newEntry = {
    id: `ENT-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    synced: false, // Always boolean untuk consistency - MUST be false for new entries
    ...sanitized,
  }

  // CRITICAL: Ensure synced is ALWAYS false for new entries
  // Don't let sanitized entry override this
  newEntry.synced = false

  try {
    await db.addEntry(newEntry)
    return newEntry
  } catch (error) {
    // Handle quota errors
    const quotaInfo = handleQuotaError(error, (action) => {
      // Action handler bisa di-pass dari component
      console.log('Quota action requested:', action)
    })
    
    if (quotaInfo.isQuotaError) {
      throw new Error(quotaInfo.message)
    }
    
    throw error
  }
}

export async function saveEntries(entries) {
  await db.saveEntries(entries)
}

/**
 * Syncs unsynced data to server dengan multi-tab lock protection.
 * 1. Acquire sync lock (prevent concurrent sync)
 * 2. Find unsynced entries menggunakan index query (efficient)
 * 3. POST to server
 * 4. Atomic batch update untuk mark entries as synced
 * 5. Release lock
 */
export async function syncEntriesToServer() {
  // Check if sync already in progress (any tab)
  const inProgress = await isSyncInProgress()
  if (inProgress) {
    // Try to wait for lock (max 2 seconds)
    const acquired = await waitForSyncLock(2000)
    if (!acquired) {
      return { 
        success: false, 
        error: 'Sync sedang berjalan di tab lain. Silakan tunggu sebentar.',
        syncedCount: 0 
      }
    }
  } else {
    // Try to acquire lock
    const lockResult = await acquireSyncLock()
    if (!lockResult.acquired) {
      // Another tab acquired lock just now, wait a bit
      const acquired = await waitForSyncLock(2000)
      if (!acquired) {
        return { 
          success: false, 
          error: 'Tidak dapat memperoleh lock untuk sync. Silakan coba lagi.',
          syncedCount: 0 
        }
      }
    }
  }

  let unsynced = []
  try {
    // Use index query untuk get unsynced entries (efficient, no full table scan)
    unsynced = await db.getUnsyncedEntries()

    console.log(`[syncEntriesToServer] Found ${unsynced.length} unsynced entries to sync`)

    if (unsynced.length === 0) {
      await releaseSyncLock()
      return { success: true, syncedCount: 0 }
    }

    // Debug: log first few entry IDs untuk verify
    if (unsynced.length > 0) {
      console.log(`[syncEntriesToServer] First entry:`, {
        id: unsynced[0].id,
        formType: unsynced[0].formType,
        synced: unsynced[0].synced,
        createdAt: unsynced[0].createdAt
      })
    }

    // Call API
    const responseData = await api.pushEntries(unsynced)

    // Mark as synced - use atomic batch update dalam single transaction
    const syncedIds = new Set(Array.isArray(responseData.syncedIds) ? responseData.syncedIds : [])

    // Atomic batch update: semua updates dalam single transaction
    const dbInstance = await db.initDB()
    const tx = dbInstance.transaction('entries', 'readwrite')
    const store = tx.objectStore('entries')
    
    let count = 0
    for (const entry of unsynced) {
      if (syncedIds.has(entry.id)) {
        entry.synced = true // Ensure boolean
        store.put(entry)
        count++
      }
    }
    
    await tx.done // Commit transaction atomically

    await releaseSyncLock()
    return { success: true, syncedCount: count }
  } catch (err) {
    // Always release lock on error
    await releaseSyncLock().catch(console.error)
    
    console.error('Sync error:', err)
    
    // Add to retry queue jika network error atau server error
    // Only if we have unsynced entries to retry
    if (unsynced.length > 0 && 
        (err.message.includes('Network') || err.message.includes('fetch') || 
         (err.message.includes('HTTP') && !err.message.includes('401')))) {
      // Don't retry on auth errors (401)
      try {
        await addToRetryQueue(unsynced, err)
      } catch (retryError) {
        console.error('Failed to add to retry queue:', retryError)
      }
    }
    
    return { success: false, error: err.message || 'Unknown error', syncedCount: 0 }
  }
}
