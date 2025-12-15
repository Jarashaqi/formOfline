// src/utils/sync-lock.js
// Multi-tab lock mechanism untuk prevent concurrent sync
import { openDB } from 'idb'

const DB_NAME = 'wasteapp_db'
const LOCK_STORE = 'locks'
const LOCK_ID = 'sync-lock'
const LOCK_TTL_MS = 30000 // 30 seconds - cukup untuk sync operation
const LOCK_CHECK_INTERVAL = 100 // Check setiap 100ms

// Generate unique tab identifier
const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`

// BroadcastChannel untuk cross-tab coordination
let broadcastChannel = null
try {
  broadcastChannel = new BroadcastChannel('wasteapp-sync-lock')
} catch (e) {
  console.warn('BroadcastChannel not supported, using IDB-only lock:', e)
}

/**
 * Acquire lock untuk sync operation
 * Returns { acquired: boolean, lockId: string | null }
 */
export async function acquireSyncLock() {
  const db = await openDB(DB_NAME)
  
  // Check if lock exists and is still valid
  try {
    const existingLock = await db.get(LOCK_STORE, LOCK_ID)
    if (existingLock) {
      const now = Date.now()
      if (now < existingLock.expiresAt) {
        // Lock masih valid, check jika kita adalah owner
        if (existingLock.ownerId === TAB_ID) {
          // We already own the lock, extend it
          await db.put(LOCK_STORE, {
            lockId: LOCK_ID,
            ownerId: TAB_ID,
            acquiredAt: existingLock.acquiredAt,
            expiresAt: now + LOCK_TTL_MS
          })
          return { acquired: true, lockId: TAB_ID }
        }
        // Lock dipegang oleh tab lain
        return { acquired: false, lockId: null }
      } else {
        // Lock expired, remove it
        await db.delete(LOCK_STORE, LOCK_ID)
      }
    }
  } catch (e) {
    // Lock store mungkin belum ada (old schema), create it
    console.warn('Lock store not found, will be created on next DB upgrade')
  }

  // Try to acquire lock
  try {
    const now = Date.now()
    const lock = {
      lockId: LOCK_ID,
      ownerId: TAB_ID,
      acquiredAt: now,
      expiresAt: now + LOCK_TTL_MS
    }
    
    await db.put(LOCK_STORE, lock)
    
    // Broadcast lock acquisition
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'lock-acquired', lockId: LOCK_ID, ownerId: TAB_ID })
    }
    
    return { acquired: true, lockId: TAB_ID }
  } catch (e) {
    // Race condition: another tab acquired lock first
    return { acquired: false, lockId: null }
  }
}

/**
 * Release lock
 */
export async function releaseSyncLock() {
  const db = await openDB(DB_NAME)
  
  try {
    const lock = await db.get(LOCK_STORE, LOCK_ID)
    if (lock && lock.ownerId === TAB_ID) {
      await db.delete(LOCK_STORE, LOCK_ID)
      
      // Broadcast lock release
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'lock-released', lockId: LOCK_ID })
      }
    }
  } catch (e) {
    console.error('Error releasing lock:', e)
  }
}

/**
 * Wait untuk lock dengan polling
 * Returns true jika lock acquired, false jika timeout
 */
export async function waitForSyncLock(maxWaitMs = 5000) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitMs) {
    const result = await acquireSyncLock()
    if (result.acquired) {
      return true
    }
    
    // Wait sebelum retry
    await new Promise(resolve => setTimeout(resolve, LOCK_CHECK_INTERVAL))
    
    // Check for lock release via BroadcastChannel
    if (broadcastChannel) {
      // Listen for lock release messages
      const releasePromise = new Promise(resolve => {
        const handler = (event) => {
          if (event.data.type === 'lock-released') {
            broadcastChannel.removeEventListener('message', handler)
            resolve(true)
          }
        }
        broadcastChannel.addEventListener('message', handler)
        setTimeout(() => {
          broadcastChannel.removeEventListener('message', handler)
          resolve(false)
        }, LOCK_CHECK_INTERVAL)
      })
      await releasePromise
    }
  }
  
  return false
}

/**
 * Cleanup expired locks (should be called periodically)
 */
export async function cleanupExpiredLocks() {
  const db = await openDB(DB_NAME)
  const tx = db.transaction(LOCK_STORE, 'readwrite')
  const store = tx.objectStore(LOCK_STORE)
  
  const now = Date.now()
  const cursor = await store.openCursor()
  
  if (cursor) {
    do {
      if (cursor.value.expiresAt < now) {
        await cursor.delete()
      }
    } while (await cursor.continue())
  }
  
  await tx.done
}

/**
 * Check if sync is in progress (any tab)
 */
export async function isSyncInProgress() {
  const db = await openDB(DB_NAME)
  
  try {
    const lock = await db.get(LOCK_STORE, LOCK_ID)
    if (!lock) return false
    
    const now = Date.now()
    if (now >= lock.expiresAt) {
      // Expired, cleanup
      await db.delete(LOCK_STORE, LOCK_ID)
      return false
    }
    
    return true
  } catch (e) {
    return false
  }
}
