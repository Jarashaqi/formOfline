// src/utils/observability.js
// Observability utilities untuk monitoring app state

import { initDB } from './db'
import { getUnsyncedEntries } from './db'
import { isSyncInProgress } from './sync-lock'

const STORAGE_KEY_PREFIX = 'wasteapp_obs_'

/**
 * Get pending unsynced entries count
 */
export async function getPendingUnsyncedCount() {
  try {
    const unsynced = await getUnsyncedEntries()
    return unsynced.length
  } catch (e) {
    console.error('Error getting pending count:', e)
    return 0
  }
}

/**
 * Get last sync result (stored in localStorage)
 */
export function getLastSyncResult() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'lastSync')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error reading last sync result:', e)
  }
  return null
}

/**
 * Save last sync result
 */
export function saveLastSyncResult(result) {
  try {
    const data = {
      success: result.success,
      syncedCount: result.syncedCount || 0,
      error: result.error || null,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY_PREFIX + 'lastSync', JSON.stringify(data))
  } catch (e) {
    console.error('Error saving last sync result:', e)
  }
}

/**
 * Get last error message
 */
export function getLastError() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'lastError')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error reading last error:', e)
  }
  return null
}

/**
 * Save last error
 */
export function saveLastError(error) {
  try {
    const data = {
      message: error.message || String(error),
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY_PREFIX + 'lastError', JSON.stringify(data))
  } catch (e) {
    console.error('Error saving last error:', e)
  }
}

/**
 * Estimate storage usage (approximate, dalam MB)
 * Note: IndexedDB quota estimation tidak langsung available,
 * kita estimate berdasarkan jumlah entries
 */
export async function estimateStorageUsage() {
  try {
    const db = await initDB()
    const tx = db.transaction('entries', 'readonly')
    const store = tx.objectStore('entries')
    const count = await store.count()
    
    // Rough estimate: ~1KB per entry (JSON serialized)
    const estimatedBytes = count * 1024
    const estimatedMB = estimatedBytes / (1024 * 1024)
    
    await tx.done
    
    return {
      estimatedMB: estimatedMB.toFixed(2),
      entryCount: count,
      // Browser quota limits typically 50MB-1GB, tapi tidak bisa di-query langsung
      warning: estimatedMB > 40 ? 'Storage usage tinggi, pertimbangkan archival' : null
    }
  } catch (e) {
    console.error('Error estimating storage:', e)
    return {
      estimatedMB: '0.00',
      entryCount: 0,
      warning: null
    }
  }
}

/**
 * Check if sync is in progress
 */
export async function checkSyncInProgress() {
  try {
    return await isSyncInProgress()
  } catch (e) {
    return false
  }
}
