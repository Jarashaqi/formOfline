import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'

function TelurMaggotForm() {
  const navigate = useNavigate()
  const userName = getStoredUser()

  const today = useMemo(
    () => new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    []
  )

  const todayIso = useMemo(() => {
    return new Date().toISOString().slice(0, 10)
  }, [])

  // Form state
  const [weightKg, setWeightKg] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const changeWeight = (delta) => {
    setWeightKg(prev => {
      const next = (prev || 0) + delta
      if (next < 0) return 0
      if (next > 200) return 200
      return next
    })
  }

  const handleSave = async () => {
    // Validation
    if (weightKg <= 0) {
      setSaveError('Berat Telur wajib diisi dan harus lebih dari 0')
      return
    }

    try {
      const entry = {
        userName,
        formType: 'telur_maggot',
        date: todayIso,
        weightKg
      }

      await addEntry(entry)

      setSaveSuccess(true)
      setSaveError('')

      setTimeout(() => {
        setWeightKg(0)
        setSaveSuccess(false)
        navigate('/bsf')
      }, 2000)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }

  const isValid = weightKg > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Telur Maggot</h1>
            <p className="page-subtitle">Catat berat telur maggot yang dipanen</p>
          </div>
          <button
            onClick={() => navigate('/bsf')}
            className="big-button big-button-outline text-sm"
          >
            Batal
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info umum */}
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Tanggal:</span> {today} <span className="text-xs text-gray-500">(otomatis terisi)</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Petugas:</span> {userName || '-'}
          </div>
        </div>

        {/* Notif */}
        {saveSuccess && (
          <div className="card bg-gray-100 border-gray-200">
            ✓ Data telur maggot berhasil disimpan!
          </div>
        )}
        {saveError && (
          <div className="card bg-red-50 border-red-200 text-red-800">
            ✗ {saveError}
          </div>
        )}

        {/* Berat Telur */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Berat Telur (kg)</label>
            <div className="slider-container">
              <div className="weight-display">
                {weightKg.toFixed(1)} kg
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              />
              <div className="weight-controls mt-2">
                <button
                  className="weight-btn minus"
                  onClick={() => changeWeight(-0.1)}
                  disabled={weightKg <= 0}
                >
                  -
                </button>
                <span className="text-sm text-gray-700">
                  {weightKg.toFixed(1)} kg
                </span>
                <button
                  className="weight-btn plus"
                  onClick={() => changeWeight(0.1)}
                >
                  +
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Min: 0 kg | Max: 200 kg
              </div>
            </div>
          </div>
        </div>

        {/* Tombol simpan */}
        <div className="p-4">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full big-button ${isValid ? 'big-button-primary' : 'big-button-tertiary'
              }`}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

export default TelurMaggotForm
