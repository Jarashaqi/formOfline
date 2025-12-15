import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEntries, syncEntriesToServer } from '../utils/storage'
import { getStoredUser } from '../utils/auth'
import {
  getPendingUnsyncedCount,
  getLastSyncResult,
  saveLastSyncResult,
  getLastError,
  saveLastError,
  estimateStorageUsage,
  checkSyncInProgress
} from '../utils/observability'

function HistoryPage() {
  const userName = getStoredUser()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const [lastError, setLastError] = useState(null)
  const [storageUsage, setStorageUsage] = useState(null)
  const [syncInProgress, setSyncInProgress] = useState(false)

  useEffect(() => {
    loadEntries()
    loadObservability()
    
    // Refresh observability setiap 5 detik
    const interval = setInterval(() => {
      loadObservability()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const loadObservability = async () => {
    try {
      const [count, sync, error, usage, inProgress] = await Promise.all([
        getPendingUnsyncedCount(),
        Promise.resolve(getLastSyncResult()),
        Promise.resolve(getLastError()),
        estimateStorageUsage(),
        checkSyncInProgress()
      ])
      
      setPendingCount(count)
      setLastSync(sync)
      setLastError(error)
      setStorageUsage(usage)
      setSyncInProgress(inProgress)
    } catch (e) {
      console.error('Error loading observability:', e)
    }
  }

  const loadEntries = async () => {
    setLoading(true)
    try {
      const storedEntries = await getEntries() || []
      // Sort by newest first
      const sortedEntries = storedEntries.sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      setEntries(sortedEntries)
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    // Prevent double-click
    if (syncing || syncInProgress) {
      return
    }
    
    setSyncing(true)
    setSyncMessage('')

    try {
      const result = await syncEntriesToServer()
      
      // Save observability data
      saveLastSyncResult(result)
      if (result.error) {
        saveLastError(new Error(result.error))
      }
      
      if (result.success) {
        setSyncMessage(`✓ Berhasil sinkron ${result.syncedCount} entri`)
        // Reload entries to show updated sync status
        await loadEntries()
      } else {
        setSyncMessage(`✗ Gagal sinkron: ${result.error}`)
        saveLastError(new Error(result.error))
      }
    } catch (error) {
      setSyncMessage(`✗ Gagal sinkron: ${error.message}`)
      saveLastError(error)
    } finally {
      setSyncing(false)
      await loadObservability() // Refresh observability
    }
  }

  const getFormTypeLabel = (formType) => {
    const labels = {
      sampah_masuk: 'Input Sampah Masuk',
      panen_maggot: 'Input Panen Maggot',
      telur_harian: 'Panen Telur Harian',
      sampah_terpilah: 'Input Sampah Terpilah ke POC',
      panen_kohei: 'Panen Pupa dari Kohei',
      bsf_pakan: 'Input Pakan Maggot',
      panen_kasgot: 'Panen Kasgot',
      input_prepupa_kohei: 'Input Prepupa ke Kohei',
      input_sampah_kompos: 'Input Sampah ke Kompos',
      input_sampah_residu: 'Input Sampah Residu',
      telur_maggot: 'Telur Maggot'
    }
    return labels[formType] || 'Umum'
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getWasteTypeLabel = (type) => {
    if (!type) return '-'
    const labels = {
      sayur: '🌱 Sayur',
      makanan: '🍛 Makanan Matang',
      campuran: '🔁 Campuran',
      lainnya: 'Lainnya'
    }
    return labels[type] || type
  }

  const getShiftLabel = (shift) => {
    if (!shift) return '-'
    const labels = {
      pagi: 'Pagi',
      siang: 'Siang',
      malam: 'Malam'
    }
    return labels[shift] || shift
  }

  const getHarvestTypeLabel = (harvestType) => {
    if (!harvestType) return '-'
    const labels = {
      dewasa: 'BSF Dewasa',
      pakan: 'BSF untuk Pakan',
      pupa: 'Pupa',
      prepupa: 'Prepupa'
    }
    return labels[harvestType] || harvestType
  }

  const formatLayingSummary = (entry) => {
    if (!entry || !entry.layingCages) return null
    return {
      totalLaying: entry.totalLaying || entry.layingCages.length,
      totalCages: entry.totalCages || 72
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Riwayat Entri</h1>
            <p className="page-subtitle">Data yang telah dicatat di lapangan</p>
          </div>
          <Link
            to="/home"
            className="big-button big-button-outline text-sm"
          >
            Kembali
          </Link>
        </div>
      </div>

      <div className="p-4">
        {/* Sync button and observability stats */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handleSync}
              disabled={syncing || syncInProgress}
              className={`px-6 py-3 rounded-lg font-medium ${(syncing || syncInProgress)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-black'
                }`}
            >
              {syncing || syncInProgress ? 'Menyinkronkan...' : '🔄 Sinkron Data'}
            </button>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total: {entries.length} entri | Belum sinkron: {pendingCount}</div>
              {storageUsage && (
                <div className="text-xs">
                  Storage: ~{storageUsage.estimatedMB} MB ({storageUsage.entryCount} entries)
                  {storageUsage.warning && (
                    <span className="text-orange-600 ml-2">⚠ {storageUsage.warning}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Observability info */}
          <div className="mt-3 space-y-2">
            {lastSync && (
              <div className="text-xs text-gray-500">
                Last sync: {new Date(lastSync.timestamp).toLocaleString('id-ID')} 
                {lastSync.success ? (
                  <span className="text-green-600 ml-2">✓ {lastSync.syncedCount} synced</span>
                ) : (
                  <span className="text-red-600 ml-2">✗ Failed</span>
                )}
              </div>
            )}
            {lastError && (
              <div className="text-xs text-red-600">
                Last error: {lastError.message} ({new Date(lastError.timestamp).toLocaleString('id-ID')})
              </div>
            )}
            {syncInProgress && !syncing && (
              <div className="text-xs text-blue-600">
                ⚠ Sync sedang berjalan di tab lain
              </div>
            )}
          </div>

          {syncMessage && (
            <div className={`mt-3 p-3 rounded-lg text-center ${syncMessage.includes('Gagal')
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
              {syncMessage}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Memuat data...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p>Belum ada entri</p>
            <p className="text-sm mt-2">Mulai catat data di lapangan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">
                      {formatDateTime(entry.createdAt)}
                    </div>
                    <div className="mt-1 inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {getFormTypeLabel(entry.formType)}
                    </div>
                  </div>

                  {!entry.synced && (
                    <div className="flex items-center ml-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="ml-1 text-xs text-red-600">Belum</span>
                    </div>
                  )}
                </div>


                <div className="mt-2 text-sm text-gray-600 mb-1">
                  <span className="font-medium">Lokasi:</span>{' '}
                  {entry.locationName || entry.locationId || '-'}
                </div>

                {/* khusus telur harian */}
                {entry.formType === 'telur_harian' && entry.layingCages && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Kandang bertelur:</span>{' '}
                    {formatLayingSummary(entry)?.totalLaying} / {formatLayingSummary(entry)?.totalCages}
                    <div className="text-xs text-gray-500 mt-1">
                      {entry.layingCages.slice(0, 12).join(', ')}
                      {entry.layingCages.length > 12 && ' ...'}
                    </div>
                  </div>
                )}

                {/* Tambahkan ini untuk tipe panen, kalau ada */}
                {entry.harvestType && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Tipe:</span>{' '}
                    {getHarvestTypeLabel(entry.harvestType)}
                  </div>
                )}


                {/* Jenis hanya untuk form yang punya wasteType (Sampah Masuk) */}
                {entry.wasteType && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Jenis:</span>{' '}
                    {getWasteTypeLabel(entry.wasteType)}
                  </div>
                )}
                {entry.formType === 'sampah_terpilah' && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Organik:</span> {entry.organicKg || 0} kg
                    <span className="ml-2 font-medium">Non Organik:</span> {entry.inorganicKg || 0} kg
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  {entry.shift && (
                    <>
                      <span className="font-medium">Shift:</span>{' '}
                      {getShiftLabel(entry.shift)}
                      <span className="mx-1">|</span>
                    </>
                  )}
                  <span className="font-medium">Berat:</span> {entry.weightKg} kg
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Petugas: {entry.userName || userName || '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
