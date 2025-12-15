import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'
import QRScanner from '../components/QRScanner'

// Lokasi hardcode sama seperti form lain
const LOCATIONS = [
  { id: "LOC-RUMAH-01", name: "Rumah 01" },
  { id: "LOC-RUMAH-02", name: "Rumah 02" },
  { id: "LOC-RESTO-A", name: "Resto A" },
  { id: "LOC-RESTO-B", name: "Resto B" },
  { id: "LOC-KANTIN", name: "Kantin" }
]

// Tipe panen maggot
const HARVEST_TYPES = [
  { id: 'dewasa', label: 'Baby BSF', value: 'Baby' },
  { id: 'pakan', label: 'BSF untuk Pakan', value: 'pakan' },
  { id: 'pupa', label: 'Pupa', value: 'pupa' },
  { id: 'prepupa', label: 'Prepupa', value: 'prepupa' }
]

function PanenMaggotForm() {
  const navigate = useNavigate()
  const userName = getStoredUser()

  // state form
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [manualLocation, setManualLocation] = useState('')
  const [harvestType, setHarvestType] = useState('')   // 👈 tipe panen
  const [weight, setWeight] = useState(0)

  // state ui
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scanError, setScanError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleQRScan = () => {
    setShowQRScanner(true)
    setScanError('')
  }

  const handleScanSuccess = (decodedText) => {
    const location = LOCATIONS.find(loc => loc.id === decodedText)
    if (location) {
      setLocationId(location.id)
      setLocationName(location.name)
      setManualLocation(location.id)
      setShowQRScanner(false)
      setScanError('')
    } else {
      setScanError(`Kode Tempat tidak ditemukan: ${decodedText}`)
    }
  }

  const handleScanError = (errorMessage) => {
    console.error('QR Scan Error:', errorMessage)
    setScanError(`Scan error: ${errorMessage}`)
  }

  const handleScannerClose = () => {
    setShowQRScanner(false)
    setScanError('')
  }

  const handleManualLocationChange = (e) => {
    const selectedId = e.target.value
    const location = LOCATIONS.find(loc => loc.id === selectedId)
    if (location) {
      setLocationId(location.id)
      setLocationName(location.name)
      setManualLocation(selectedId)
    }
  }

  const handleSave = async () => {
    if (!locationId) {
      setSaveError('Kode Tempat wajib diisi')
      return
    }
    if (!harvestType) {
      setSaveError('Tipe Panen wajib diisi')
      return
    }
    if (weight <= 0) {
      setSaveError('Berat Panen wajib diisi dan harus lebih dari 0')
      return
    }

    try {
      const entry = {
        userName,
        formType: 'panen_maggot',
        locationId,
        locationName,
        harvestType,      // 👈 simpan tipe panen
        weightKg: weight
      }

      await addEntry(entry)

      setSaveSuccess(true)
      setSaveError('')

      setTimeout(() => {
        // reset form & balik ke home
        setLocationId('')
        setLocationName('')
        setManualLocation('')
        setHarvestType('')
        setWeight(0)
        setSaveSuccess(false)
        navigate('/home')
      }, 1500)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }

  const isValid = locationId && harvestType && weight > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Input Panen Maggot</h1>
            <p className="page-subtitle">Catat panen maggot berdasarkan tipe panen</p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="big-button big-button-outline text-sm"
          >
            Batal
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Notif sukses / error */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
            ✓ Entri panen maggot berhasil disimpan!
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
            ✗ {saveError}
          </div>
        )}

        {/* Lokasi */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Kode Tempat</label>

            <button
              onClick={handleQRScan}
              className="w-full big-button big-button-primary mb-3"
            >
              Scan QR Kode Tempat
            </button>

            <div className="text-sm text-gray-600 mb-2">atau pilih manual:</div>

            <select
              value={manualLocation}
              onChange={handleManualLocationChange}
              className="form-input"
            >
              <option value="">Pilih Kode Tempat...</option>
              {LOCATIONS.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.id})
                </option>
              ))}
            </select>

            {locationName && (
              <div className="mt-3 p-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
                <div className="font-medium">Kode Tempat Terpilih:</div>
                <div className="text-sm">{locationName} ({locationId})</div>
              </div>
            )}

            {scanError && (
              <div className="mt-2 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
                {scanError}
              </div>
            )}
          </div>
        </div>

        {/* Tipe Panen */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Tipe Panen</label>
            <div className="grid-2">
              {HARVEST_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setHarvestType(type.value)}
                  className={`toggle-button ${harvestType === type.value ? 'active' : ''}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Berat Panen */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Berat Panen (kg)</label>
            <div className="slider-container">
              <div className="weight-display">
                {weight.toFixed(1)} kg
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
              />

              <div className="weight-controls">
                <button
                  className="weight-btn minus"
                  onClick={() => setWeight(Math.max(0, weight - 0.5))}
                  disabled={weight <= 0}
                >
                  -
                </button>

                <span className="text-sm text-gray-700">
                  {weight.toFixed(1)} kg
                </span>

                <button
                  className="weight-btn plus"
                  onClick={() => setWeight(Math.min(50, weight + 0.5))}
                  disabled={weight >= 50}
                >
                  +
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Min: 0 kg | Max: 50 kg
              </div>
            </div>
          </div>
        </div>

        {/* Tombol simpan */}
        <div className="p-4">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full big-button ${isValid
                ? 'big-button-primary'
                : 'big-button-tertiary'
              }`}
          >
            Simpan
          </button>
        </div>
      </div>

      {/* Modal QR scanner */}
      {showQRScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          onClose={handleScannerClose}
        />
      )}
    </div>
  )
}

export default PanenMaggotForm
