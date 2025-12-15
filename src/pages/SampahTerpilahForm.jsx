import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'
import QRScanner from '../components/QRScanner'

// Lokasi sama seperti form lainnya
const LOCATIONS = [
  { id: "LOC-RUMAH-01", name: "Rumah 01" },
  { id: "LOC-RUMAH-02", name: "Rumah 02" },
  { id: "LOC-RESTO-A", name: "Resto A" },
  { id: "LOC-RESTO-B", name: "Resto B" },
  { id: "LOC-KANTIN", name: "Kantin" }
]

const SHIFTS = [
  { id: 'pagi', label: 'Pagi', value: 'pagi' },
  { id: 'siang', label: 'Siang', value: 'siang' },
  { id: 'malam', label: 'Malam', value: 'malam' }
]

function SampahTerpilahForm() {
  const navigate = useNavigate()
  const userName = getStoredUser()

  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [manualLocation, setManualLocation] = useState('')

  const [shift, setShift] = useState('')

  const [organicWeight, setOrganicWeight] = useState(0)
  const [inorganicWeight, setInorganicWeight] = useState(0)

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
      setSaveError('Kode Tempat POC wajib diisi')
      return
    }
    if (!shift) {
      setSaveError('Shift wajib diisi')
      return
    }
    if (organicWeight <= 0 && inorganicWeight <= 0) {
      setSaveError('Minimal salah satu berat sampah (organik atau non organik) wajib diisi dan harus lebih dari 0')
      return
    }

    try {
      const entry = {
        userName,
        formType: 'sampah_terpilah',
        locationId,
        locationName,
        shift,
        organicKg: organicWeight,
        inorganicKg: inorganicWeight
      }

      await addEntry(entry)

      setSaveSuccess(true)
      setSaveError('')

      setTimeout(() => {
        setLocationId('')
        setLocationName('')
        setManualLocation('')
        setShift('')
        setOrganicWeight(0)
        setInorganicWeight(0)
        setSaveSuccess(false)
        navigate('/home')
      }, 1500)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }

  const isValid = locationId && shift && (organicWeight > 0 || inorganicWeight > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Input Sampah Terpilah ke POC</h1>
            <p className="page-subtitle">
              Catat berat sampah organik dan non organik yang terpilah
            </p>
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
        {/* Notif */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
            ✓ Data sampah terpilah berhasil disimpan!
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
            <label className="form-label">Kode Tempat POC</label>

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

        {/* Shift */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Shift</label>
            <div className="grid-3">
              {SHIFTS.map(shiftItem => (
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

        {/* Berat Organik */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Berat Sampah Organik (kg)</label>
            <div className="slider-container">
              <div className="weight-display">
                {organicWeight.toFixed(1)} kg
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={organicWeight}
                onChange={(e) => setOrganicWeight(parseFloat(e.target.value))}
              />
              <div className="text-sm text-gray-500">
                Min: 0 kg | Max: 50 kg
              </div>
            </div>
          </div>
        </div>

        {/* Berat Non Organik */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Berat Sampah Non Organik (kg)</label>
            <div className="slider-container">
              <div className="weight-display">
                {inorganicWeight.toFixed(1)} kg
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={inorganicWeight}
                onChange={(e) => setInorganicWeight(parseFloat(e.target.value))}
              />
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

      {/* QR Scanner */}
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

export default SampahTerpilahForm