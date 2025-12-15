import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'

const COLUMNS = ['A', 'B', 'C', 'D']
const ROWS = Array.from({ length: 18 }, (_, i) => i + 1) // A1–D18

function TelurHarianForm() {
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

  const [selectedColumn, setSelectedColumn] = useState('A')

  // TRUE kalau kandang bertelur
  const [cageStates, setCageStates] = useState(() => {
    const initial = {}
    COLUMNS.forEach(col => {
      ROWS.forEach(num => {
        const id = `${col}${num}`
        initial[id] = false
      })
    })
    return initial
  })

  // total berat (kg) dan telur retak
  const [totalWeightKg, setTotalWeightKg] = useState(0)
  const [crackedCount, setCrackedCount] = useState(0)

  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const layingCages = useMemo(
    () => Object.entries(cageStates)
      .filter(([_, value]) => value)
      .map(([id]) => id),
    [cageStates]
  )

  const totalCages = COLUMNS.length * ROWS.length
  const totalLaying = layingCages.length

  const handleToggleCage = (cageId) => {
    setCageStates(prev => ({
      ...prev,
      [cageId]: !prev[cageId]
    }))
  }

  const handleWeightInputChange = (e) => {
    const value = e.target.value
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) {
      setTotalWeightKg(0)
    } else {
      setTotalWeightKg(num)
    }
  }

  const changeWeightByStep = (delta) => {
    setTotalWeightKg(prev => {
      const next = (prev || 0) + delta
      return next < 0 ? 0 : next
    })
  }

  const handleSave = async () => {
    if (totalLaying === 0) {
      setSaveError('Minimal satu kandang wajib ditandai bertelur')
      return
    }
    if (totalWeightKg <= 0) {
      setSaveError('Berat Telur wajib diisi dan harus lebih dari 0')
      return
    }

    try {
      const isoDate = new Date().toISOString().slice(0, 10)

      const entry = {
        userName,
        formType: 'telur_harian',
        date: isoDate,
        locationName: 'Kandang Ayam',
        layingCages,                 // array: A1, A2, B5, ...
        totalCages,
        totalLaying,
        totalWeightGram: Math.round(totalWeightKg * 1000), // simpan dalam gram untuk kompatibilitas
        totalWeightKg,                // simpan juga dalam kg
        crackedEggs: crackedCount
      }

      await addEntry(entry)

      setSaveSuccess(true)
      setSaveError('')

      setTimeout(() => {
        setSaveSuccess(false)
        navigate('/home')
      }, 1500)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }

  const isValid = totalLaying > 0 && totalWeightKg > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Panen Telur Harian</h1>
            <p className="page-subtitle">
              Pilih kandang yang bertelur dan catat berat telur
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
            ✓ Data panen telur berhasil disimpan!
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
            ✗ {saveError}
          </div>
        )}

        {/* Info tanggal & ringkasan */}
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Tanggal:</span> {today} <span className="text-xs text-gray-500">(otomatis terisi)</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Kandang bertelur:</span>{' '}
            {totalLaying} / {totalCages}
          </div>
        </div>

        {/* Total berat & telur retak */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Berat Telur (kg)</label>
            <div className="weight-controls">
              <button
                className="weight-btn minus"
                onClick={() => changeWeightByStep(-WEIGHT_STEP)}
                disabled={totalWeightKg <= 0}
              >
                -
              </button>

              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                style={{ maxWidth: '140px', textAlign: 'center' }}
                value={totalWeightKg.toFixed(2)}
                onChange={handleWeightInputChange}
                inputMode="decimal"
                placeholder="0.00"
              />

              <button
                className="weight-btn plus"
                onClick={() => changeWeightByStep(0.1)}
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Step: {WEIGHT_STEP} gram | Perkiraan: {totalWeightKg.toFixed(2)} kg
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">🥚 Telur Retak</label>
            <div className="weight-controls">
              <button
                className="weight-btn minus"
                onClick={() => setCrackedCount(Math.max(0, crackedCount - 1))}
                disabled={crackedCount <= 0}
              >
                -
              </button>
              <span className="text-sm text-gray-700">
                {crackedCount} butir
              </span>
              <button
                className="weight-btn plus"
                onClick={() => setCrackedCount(crackedCount + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Tab A/B/C/D */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Blok Kandang</label>
            <div className="flex gap-2 mb-3">
              {COLUMNS.map(col => (
                <button
                  key={col}
                  onClick={() => setSelectedColumn(col)}
                  className={`flex-1 toggle-button ${selectedColumn === col ? 'active' : ''
                    }`}
                >
                  {col}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-500 mb-2">
              Pilih blok A/B/C/D, lalu tap kandang yang <strong>bertelur</strong>.
              Scroll ke samping jika nomor kandang tidak muat.
            </div>

            {/* Baris kandang – tombol kecil horizontal (A1–A18, dst) */}
            <div className="cage-row">
              {ROWS.map(num => {
                const cageId = `${selectedColumn}${num}`
                const active = cageStates[cageId]

                return (
                  <button
                    key={cageId}
                    onClick={() => handleToggleCage(cageId)}
                    className={`cage-pill ${active ? 'active' : ''}`}
                  >
                    <span className="cage-pill-label">{cageId}</span>
                    {active && <span className="cage-pill-dot">●</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Ringkasan singkat */}
        {totalLaying > 0 && (
          <div className="card">
            <div className="text-sm text-gray-700 mb-1 font-medium">
              Ringkasan Cepat
            </div>
            <div className="text-xs text-gray-600">
              Kandang bertelur: <strong>{totalLaying}</strong> / {totalCages}
            </div>
            <div className="text-xs text-gray-600">
              Total berat: <strong>{totalWeightKg.toFixed(2)} kg</strong>
            </div>
            {crackedCount > 0 && (
              <div className="text-xs text-gray-600">
                Telur retak: <strong>{crackedCount} butir</strong>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Contoh kandang: {layingCages.slice(0, 12).join(', ')}
              {layingCages.length > 12 && ' ...'}
            </div>
          </div>
        )}

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
    </div>
  )
}

export default TelurHarianForm
