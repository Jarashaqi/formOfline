// src/utils/db.js
import { openDB } from 'idb'

const DB_NAME = 'wasteapp_db'
const DB_VERSION = 2 // Bumped untuk schema changes
export const STORE_NAME = 'entries' // Export untuk digunakan di storage.js
const LOCK_STORE = 'locks'

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Create entries store jika belum ada
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                })
                // Indexes for querying
                store.createIndex('createdAt', 'createdAt')
                store.createIndex('synced', 'synced')
                store.createIndex('formType', 'formType')
            } else {
                // Store sudah ada, check indexes
                const store = transaction.objectStore(STORE_NAME)
                
                // Add formType index jika belum ada
                if (!store.indexNames.contains('formType')) {
                    store.createIndex('formType', 'formType')
                }
            }

            // Create locks store untuk multi-tab coordination (v2)
            if (!db.objectStoreNames.contains(LOCK_STORE)) {
                const lockStore = db.createObjectStore(LOCK_STORE, {
                    keyPath: 'lockId',
                })
                lockStore.createIndex('expiresAt', 'expiresAt')
            }

            // Create retryQueue store untuk retry mechanism (v2)
            if (!db.objectStoreNames.contains('retryQueue')) {
                const retryStore = db.createObjectStore('retryQueue', {
                    keyPath: 'id',
                })
                retryStore.createIndex('retryAt', 'retryAt')
                retryStore.createIndex('attempts', 'attempts')
            }

            // Create archive store untuk archival (v2)
            if (!db.objectStoreNames.contains('archive')) {
                const archiveStore = db.createObjectStore('archive', {
                    keyPath: 'id',
                })
                archiveStore.createIndex('archivedAt', 'archivedAt')
            }

            // Normalize synced field: convert '1', 1 → true, '0', 0, null, undefined → false
            if (oldVersion < 2) {
                const store = transaction.objectStore(STORE_NAME)
                const cursor = store.openCursor()
                
                cursor.onsuccess = (event) => {
                    const cursor = event.target.result
                    if (cursor) {
                        const entry = cursor.value
                        let normalized = false
                        
                        if (entry.synced === true || entry.synced === 'true') {
                            normalized = true
                        } else if (entry.synced === false || entry.synced === 'false' || 
                                   entry.synced === null || entry.synced === undefined ||
                                   entry.synced === 0 || entry.synced === '0') {
                            normalized = false
                        } else if (entry.synced === 1 || entry.synced === '1') {
                            normalized = true
                        } else {
                            // Unknown value, default to false
                            normalized = false
                        }
                        
                        if (entry.synced !== normalized) {
                            entry.synced = normalized
                            cursor.update(entry)
                        }
                        
                        cursor.continue()
                    }
                }
            }
        },
    })
}

export const getEntries = async () => {
    const db = await initDB()
    return db.getAllFromIndex(STORE_NAME, 'createdAt')
}

export const addEntry = async (entry) => {
    const db = await initDB()
    return db.put(STORE_NAME, entry)
}

export const updateEntry = async (entry) => {
    const db = await initDB()
    return db.put(STORE_NAME, entry)
}

export const saveEntries = async (entries) => {
    const db = await initDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    for (const entry of entries) {
        store.put(entry)
    }
    return tx.done
}

/**
 * Get unsynced entries menggunakan getAll + filter (reliable approach)
 * Returns entries where synced === false
 * 
 * Note: IndexedDB tidak support boolean sebagai key range langsung.
 * Kita gunakan getAll() + filter yang lebih reliable daripada cursor iteration
 * untuk boolean index. Untuk dataset kecil-medium (< 10k), ini masih acceptable.
 */
export const getUnsyncedEntries = async () => {
    const db = await initDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    
    // Use getAll() untuk get semua entries, lalu filter
    // Ini lebih reliable daripada cursor iteration untuk boolean index
    const allEntries = await store.getAll()
    await tx.done
    
    // Debug: log total entries untuk troubleshooting
    if (allEntries.length > 0) {
        const syncedCount = allEntries.filter(e => e.synced === true).length
        const unsyncedCount = allEntries.filter(e => e.synced === false || !e.synced).length
        console.log(`[getUnsyncedEntries] Total: ${allEntries.length}, Synced: ${syncedCount}, Unsynced: ${unsyncedCount}`)
    }
    
    // Filter untuk unsynced entries
    // Handle berbagai format: false, 0, '0', null, undefined
    const unsynced = allEntries.filter(entry => {
        // Explicit check untuk false (boolean) - most common case
        if (entry.synced === false) return true
        
        // Handle legacy values yang mungkin belum di-migrate
        if (entry.synced === 0 || entry.synced === '0') return true
        if (entry.synced === null || entry.synced === undefined) return true
        
        // Explicit check untuk truthy values yang berarti synced
        if (entry.synced === true || entry.synced === 1 || entry.synced === '1') {
            return false
        }
        
        // Default: jika tidak jelas atau missing, consider as unsynced (safer)
        // This handles edge cases where synced field might be missing
        return true
    })
    
    console.log(`[getUnsyncedEntries] Returning ${unsynced.length} unsynced entries`)
    return unsynced
}

/**
 * Helper to migrate from localStorage if needed
 * Idempotent: hanya migrate sekali, check backup key untuk prevent double migration
 */
export const migrateFromLocalStorage = async () => {
    const KEY = 'wasteapp_entries'
    const BACKUP_KEY = KEY + '_backup'
    
    // Check jika sudah di-migrate (ada backup)
    if (localStorage.getItem(BACKUP_KEY)) {
        // Already migrated, skip
        return
    }
    
    const raw = localStorage.getItem(KEY)
    if (raw) {
        try {
            const data = JSON.parse(raw)
            if (Array.isArray(data) && data.length > 0) {
                console.log(`Migrating ${data.length} items from localStorage to IndexedDB...`)
                
                // Normalize synced field sebelum save
                const normalizedData = data.map(entry => {
                    // Ensure synced is boolean
                    if (entry.synced === true || entry.synced === 'true' || entry.synced === 1 || entry.synced === '1') {
                        entry.synced = true
                    } else {
                        entry.synced = false
                    }
                    return entry
                })
                
                await saveEntries(normalizedData)
                
                // Create backup dan remove original (prevent double migration)
                localStorage.setItem(BACKUP_KEY, raw)
                localStorage.removeItem(KEY)
                
                console.log('Migration completed successfully')
            }
        } catch (e) {
            console.error('Migration failed', e)
        }
    }
}
