// src/utils/api.js

/**
 * Gets the API Base URL from environment or falls back to logic.
 */
function getApiBase() {
    // Prioritize local proxy to fix CORS issues
    const origin = window.location.origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        // USE LOCAL RELAY to perfectly mimic curl and bypass WAF/401
        return 'http://localhost:3001'
    }

    // Production/Environment override
    const envBase = import.meta.env.VITE_API_BASE
    if (envBase) return envBase.replace(/\/+$/, '')

    return '/api'
}

/**
 * Gets the API Key from environment.
 */
function getApiKey() {
    const k = import.meta.env.VITE_API_KEY
    return k || '' // Should be set in .env
}

/**
 * Pushes unsynced entries to the server.
 */
export async function pushEntries(entries) {
    const API_BASE = getApiBase()
    const API_KEY = getApiKey()
    const url = API_BASE.includes('3001')
        ? `${API_BASE}/sync`      // Relay route
        : `${API_BASE}/sync.php`  // Standard PHP route

    // Debugging logs
    console.log('Syncing to:', url)
    console.log('Using API Key:', API_KEY ? '***' + API_KEY.slice(-3) : 'NONE')

    // Use environment variable jika ada, jika tidak throw error untuk production
    // Untuk development, bisa fallback ke session-based token atau require env var
    const headerKey = API_KEY
    if (!headerKey) {
        // In production, this should be set via environment variable
        // For development, you might want to use a session token or require .env file
        throw new Error(
            'API key tidak ditemukan. Pastikan VITE_API_KEY di-set di environment variable atau .env file.'
        )
    }

    let res
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': headerKey,
            },
            body: JSON.stringify({ entries }),
        })
    } catch (fetchError) {
        // Network error - likely relay server not running
        if (url.includes('localhost:3001')) {
            throw new Error(
                'Relay server tidak berjalan. Silakan jalankan: npm run relay'
            )
        }
        throw new Error(`Network error: ${fetchError.message}`)
    }

    const text = await res.text()

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error(
                `Unauthorized (401): API key tidak valid atau relay server tidak berjalan. Pastikan relay server berjalan dengan: npm run relay`
            )
        }
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`)
    }

    let data
    try {
        data = JSON.parse(text)
    } catch (e) {
        throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`)
    }

    if (data.success !== true) {
        throw new Error(data.message || 'Server returned success=false')
    }

    return data
}
