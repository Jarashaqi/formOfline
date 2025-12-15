// src/utils/retry.js
// Retry mechanism dengan exponential backoff
// Note: Workbox Background Sync preferred, tapi ini fallback implementation

import { initDB } from './db'
import * as api from './api'
import * as storage from './storage'

const RETRY_STORE = 'retryQueue'
const MAX_RETRIES = 5
const INITIAL_DELAY_MS = 1000 // 1 second
const MAX_DELAY_MS = 30000 // 30 seconds
const BACKOFF_MULTIPLIER = 2

/**
 * Add failed sync to retry queue
 */
export async function addToRetryQueue(entries, error) {
  const db = await initDB()
  
  // Check if retry store exists
  if (!db.objectStoreNames.contains(RETRY_STORE)) {
    console.warn('Retry queue store not found, skipping retry queue')
    return
  }
  
  const retryEntry = {
    id: `retry-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    entries: entries,
    error: error.message || String(error),
    attempts: 0,
    createdAt: new Date().toISOString(),
    retryAt: Date.now() + INITIAL_DELAY_MS // Retry after initial delay
  }
  
  const tx = db.transaction(RETRY_STORE, 'readwrite')
  await tx.objectStore(RETRY_STORE).put(retryEntry)
  await tx.done
}

/**
 * Process retry queue
 */
export async function processRetryQueue() {
  const db = await initDB()
  
  if (!db.objectStoreNames.contains(RETRY_STORE)) {
    return { processed: 0, failed: 0 }
  }
  
  const tx = db.transaction(RETRY_STORE, 'readwrite')
  const store = tx.objectStore(RETRY_STORE)
  const index = store.index('retryAt')
  
  const now = Date.now()
  let processed = 0
  let failed = 0
  
  // Get entries ready for retry
  let cursor = await index.openCursor(IDBKeyRange.upperBound(now))
  
  while (cursor) {
    const retryEntry = cursor.value
    
    if (retryEntry.attempts >= MAX_RETRIES) {
      // Max retries reached, remove from queue
      await cursor.delete()
      failed++
    } else {
      // Try to sync
      try {
        const result = await api.pushEntries(retryEntry.entries)
        
        if (result.success) {
          // Success, remove from queue
          await cursor.delete()
          processed++
        } else {
          // Still failed, update retry time dengan exponential backoff
          const delay = Math.min(
            INITIAL_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, retryEntry.attempts),
            MAX_DELAY_MS
          )
          // Add jitter (±20%)
          const jitter = delay * 0.2 * (Math.random() * 2 - 1)
          retryEntry.retryAt = now + delay + jitter
          retryEntry.attempts++
          await cursor.update(retryEntry)
        }
      } catch (error) {
        // Network error, update retry time
        const delay = Math.min(
          INITIAL_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, retryEntry.attempts),
          MAX_DELAY_MS
        )
        const jitter = delay * 0.2 * (Math.random() * 2 - 1)
        retryEntry.retryAt = now + delay + jitter
        retryEntry.attempts++
        retryEntry.error = error.message || String(error)
        await cursor.update(retryEntry)
      }
    }
    
    cursor = await cursor.continue()
  }
  
  await tx.done
  
  return { processed, failed }
}

/**
 * Get retry queue stats
 */
export async function getRetryQueueStats() {
  const db = await initDB()
  
  if (!db.objectStoreNames.contains(RETRY_STORE)) {
    return { pending: 0, failed: 0 }
  }
  
  const tx = db.transaction(RETRY_STORE, 'readonly')
  const store = tx.objectStore(RETRY_STORE)
  const count = await store.count()
  await tx.done
  
  return {
    pending: count,
    failed: 0 // Could track separately if needed
  }
}
