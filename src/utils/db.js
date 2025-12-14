// src/utils/db.js
import { openDB } from 'idb'

const DB_NAME = 'wasteapp_db'
const DB_VERSION = 1
const STORE_NAME = 'entries'

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                })
                // Indexes for querying
                store.createIndex('createdAt', 'createdAt')
                store.createIndex('synced', 'synced')
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

export const getUnsyncedEntries = async () => {
    const db = await initDB()
    return db.getAllFromIndex(STORE_NAME, 'synced', 0) // Assuming 0/false for unsynced
}

// Helper to migrate from localStorage if needed
export const migrateFromLocalStorage = async () => {
    const KEY = 'wasteapp_entries'
    const raw = localStorage.getItem(KEY)
    if (raw) {
        try {
            const data = JSON.parse(raw)
            if (Array.isArray(data) && data.length > 0) {
                console.log(`Migrating ${data.length} items from localStorage to IndexedDB...`)
                await saveEntries(data)
                // renaming key to avoid double migration but keeping backup
                localStorage.setItem(KEY + '_backup', raw)
                localStorage.removeItem(KEY)
            }
        } catch (e) {
            console.error('Migration failed', e)
        }
    }
}
