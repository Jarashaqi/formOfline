import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'
import QRScanner from '../components/QRScanner'

// Hardcoded locations
const LOCATIONS = [
  { id: "LOC-RUMAH-01", name: "Rumah 01" },
  { id: "LOC-RUMAH-02", name: "Rumah 02" },
  { id: "LOC-RESTO-A", name: "Resto A" },
  { id: "LOC-RESTO-B", name: "Resto B" },
  { id: "LOC-KANTIN", name: "Kantin" }
]

function SampahMasukForm() {
  const navigate = useNavigate()
  const userName = getStoredUser()

  // Form state
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [wasteType, setWasteType] = useState('')
  const [shift, setShift] = useState('')
  const [weight, setWeight] = useState(0)
  const [manualLocation, setManualLocation] = useState('')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scanError, setScanError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const wasteTypes = [
    { id: 'sayur', label: '🌱 Sayur', value: 'sayur' },
    { id: 'makanan', label: '🍛 Makanan Matang', value: 'makanan' },
    { id: 'campuran', label: '🔁 Campuran', value: 'campuran' },
    { id: 'lainnya', label: 'Lainnya', value: 'lainnya' }
  ]

  const shifts = [
    { id: 'pagi', label: 'Pagi', value: 'pagi' },
    { id: 'siang', label: 'Siang', value: 'siang' },
    { id: 'malam', label: 'Malam', value: 'malam' }
  ]

  const handleQRScan = () => {
    setShowQRScanner(true)
    setScanError('')
  }

  const handleScanSuccess = (decodedText) => {
    // Look up location by ID
    const location = LOCATIONS.find(loc => loc.id === decodedText)
    if (location) {
      setLocationId(location.id)
      setLocationName(location.name)
      setManualLocation(location.id)
      setShowQRScanner(false)
      setScanError('')
    } else {
      setScanError(`Lokasi tidak ditemukan: ${decodedText}`)
    }
  }

  const handleScanError = (errorMessage) => {
    setScanError(`Scan error: ${errorMessage}`)
    console.error('QR Scan Error:', errorMessage)
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
    // Validation
    if (!locationId || !wasteType || !shift || weight <= 0) {
      setSaveError('Harap lengkapi semua field')
      return
    }

    try {
      // Create entry object
      const entry = {
        userName,
        formType: 'sampah_masuk',
        locationId,
        locationName,
        wasteType,
        shift,
        weightKg: weight
      }

      // Save to localStorage
      const savedEntry = await addEntry(entry)

      // Show success message
      setSaveSuccess(true)
      setSaveError('')

      // Clear form after 2 seconds and navigate home
      setTimeout(() => {
        // Reset form
        setLocationId('')
        setLocationName('')
        setWasteType('')
        setShift('')
        setWeight(0)
        setManualLocation('')
        setSaveSuccess(false)
        navigate('/home')
      }, 2000)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }

  const isValid = locationId && wasteType && shift && weight > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Sampah Masuk</h1>
            <p className="page-subtitle">Catat data sampah yang masuk</p>
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
        {/* Success message */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
            ✓ Entri berhasil disimpan!
          </div>
        )}

        {/* Error message */}
        {saveError && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
            ✗ {saveError}
          </div>
        )}

        {/* Location Section */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">📍 Lokasi</label>
            <button
              onClick={handleQRScan}
              className="w-full big-button big-button-primary mb-3"
            >
              🔍 Scan QR Lokasi
            </button>

            <div className="text-sm text-gray-600 mb-2">atau pilih manual:</div>
            <select
              value={manualLocation}
              onChange={handleManualLocationChange}
              className="form-input"
            >
              <option value="">Pilih lokasi...</option>
              {LOCATIONS.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.id})
                </option>
              ))}
            </select>

            {locationName && (
              <div className="mt-3 p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
                <div className="font-medium">Lokasi Terpilih:</div>
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

        {/* Waste Type Section */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">🗂️ Jenis Sampah</label>
            <div className="grid-2">
              {wasteTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setWasteType(type.value)}
                  className={`toggle-button ${wasteType === type.value ? 'active' : ''}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shift Section */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">⏰ Shift</label>
            <div className="grid-3">
              {shifts.map(shiftItem => (
                <button
                  key={shiftItem.id}
                  onClick={() => setShift(shiftItem.value)}
                  className={`toggle-button ${shift === shiftItem.value ? 'active' : ''}`}
                >
                  {shiftItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weight Section */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">⚖️ Berat (kg)</label>
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
                className="w-full max-w-md"
              />
              <div className="weight-controls">
                <button
                  className="weight-btn minus"
                  onClick={() => setWeight(Math.max(0, weight - 0.5))}
                  disabled={weight <= 0}
                >
                  -
                </button>
                <span className="text-lg font-semibold min-w-[100px] text-center bg-white px-4 py-2 rounded-lg border border-gray-200">
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
              <div className="text-sm text-gray-600">
                Min: 0 kg | Max: 50 kg
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-4">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full big-button ${isValid
                ? 'big-button-primary'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
          >
            SIMPAN ENTRI
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
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

export default SampahMasukForm