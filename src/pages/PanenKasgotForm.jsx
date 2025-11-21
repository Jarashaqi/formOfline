import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'

const WEIGHT_STEP_KG = 1

function PanenKasgotForm() {
  const navigate = useNavigate()
  const userName = getStoredUser()

  const nowDisplay = useMemo(() => {
    return new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const todayIso = useMemo(() => {
    return new Date().toISOString().slice(0, 10)
  }, [])

  const [weightKg, setWeightKg] = useState(0)
  const [source, setSource] = useState('')  // from where
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

  const handleSave = () => {
    if (!source) {
      setSaveError('Harap isi sumber kasgot (dari mana)')
      return
    }
    if (weightKg <= 0) {
      setSaveError('Berat kasgot harus lebih dari 0 kg')
      return
    }

    try {
      const entry = {
        formType: 'panen_kasgot',
        date: todayIso,
        userName,
        weightKg,
        source // dari mana (bed, box, lokasi)
      }

      addEntry(entry)

      setSaveSuccess(true)
      setSaveError('')

      setTimeout(() => {
        setSaveSuccess(false)
        setWeightKg(0)
        setSource('')
        navigate('/bsf')
      }, 1500)
    } catch (err) {
      setSaveError('Gagal menyimpan entri: ' + err.message)
    }
  }

  const isValid = weightKg > 0 && !!source

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Panen Kasgot</h1>
            <p className="page-subtitle">Catat panen kasgot (frass BSF)</p>
          </div>
          <button 
            onClick={() => navigate('/bsf')}
            className="big-button big-button-outline text-sm"
          >
            Kembali
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info umum */}
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Waktu:</span> {nowDisplay}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Petugas:</span> {userName || '-'}
          </div>
        </div>

        {/* Notif */}
        {saveSuccess && (
          <div className="card bg-gray-100 border-gray-200">
            ✓ Panen kasgot berhasil disimpan!
          </div>
        )}
        {saveError && (
          <div className="card bg-red-50 border-red-200 text-red-800">
            ✗ {saveError}
          </div>
        )}

        {/* Sumber */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">📍 Dari mana (bed/box/lokasi)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Bed Kompos 1, Box BSF 03"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        </div>

        {/* Berat */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">⚖️ Berat Kasgot (kg)</label>
            <div className="slider-container">
              <div className="weight-display">
                {weightKg.toFixed(1)} kg
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              />
              <div className="weight-controls mt-2">
                <button
                  className="weight-btn minus"
                  onClick={() => changeWeight(-WEIGHT_STEP_KG)}
                  disabled={weightKg <= 0}
                >
                  -
                </button>
                <span className="text-sm text-gray-700">
                  {weightKg.toFixed(1)} kg
                </span>
                <button
                  className="weight-btn plus"
                  onClick={() => changeWeight(WEIGHT_STEP_KG)}
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
            className={`w-full big-button ${
              isValid ? 'big-button-primary' : 'big-button-tertiary'
            }`}
          >
            SIMPAN PANEN KASGOT
          </button>
        </div>
      </div>
    </div>
  )
}

export default PanenKasgotForm
