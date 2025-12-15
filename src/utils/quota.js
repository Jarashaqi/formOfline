// src/utils/quota.js
// Quota handling + archival strategy

import { initDB } from './db'

const ARCHIVE_STORE = 'archive'
const ARCHIVE_AGE_DAYS = 90 // Archive records older than 90 days

/**
 * Handle QuotaExceededError dengan user-friendly message
 */
export function handleQuotaError(error, onAction) {
  if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
    return {
      isQuotaError: true,
      message: 'Storage penuh. Pilih aksi:',
      actions: [
        { label: 'Sinkronkan Sekarang', action: 'sync' },
        { label: 'Arsipkan Data Lama', action: 'archive' },
        { label: 'Ekspor Data', action: 'export' }
      ],
      onAction
    }
  }
  return { isQuotaError: false }
}

/**
 * Archive old entries (move to archive store)
 */
export async function archiveOldEntries(olderThanDays = ARCHIVE_AGE_DAYS) {
  const db = await initDB()
  
  // Check if archive store exists, create if not
  if (!db.objectStoreNames.contains(ARCHIVE_STORE)) {
    // Archive store akan dibuat di migration berikutnya
    console.warn('Archive store not found, skipping archival')
    return { archived: 0 }
  }
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
  const cutoffISO = cutoffDate.toISOString()
  
  const tx = db.transaction(['entries', ARCHIVE_STORE], 'readwrite')
  const entriesStore = tx.objectStore('entries')
  const archiveStore = tx.objectStore(ARCHIVE_STORE)
  const index = entriesStore.index('createdAt')
  
  let archived = 0
  let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoffISO))
  
  while (cursor) {
    const entry = cursor.value
    // Only archive synced entries (don't archive unsynced data)
    if (entry.synced === true) {
      const archivedEntry = {
        ...entry,
        archivedAt: new Date().toISOString(),
        originalId: entry.id
      }
      await archiveStore.put(archivedEntry)
      await cursor.delete()
      archived++
    }
    cursor = await cursor.continue()
  }
  
  await tx.done
  
  return { archived }
}

/**
 * Export entries to JSON file
 */
export async function exportEntriesToFile() {
  const db = await initDB()
  const tx = db.transaction('entries', 'readonly')
  const store = tx.objectStore('entries')
  const entries = await store.getAll()
  await tx.done
  
  const dataStr = JSON.stringify(entries, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `wasteapp-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  return { exported: entries.length }
}

/**
 * Get storage quota estimate dan warning
 */
export async function getStorageQuotaInfo() {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercent: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(1) : 'N/A',
        warning: estimate.quota && (estimate.usage / estimate.quota) > 0.8
      }
    }
  } catch (e) {
    console.warn('Storage quota API not available:', e)
  }
  
  return {
    usage: 0,
    quota: 0,
    usagePercent: 'N/A',
    warning: false
  }
}
