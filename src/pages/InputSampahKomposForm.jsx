import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'

function InputSampahKomposForm() {
  const navigate = useNavigate()
  const userName = getStoredUser()

  // Form state
  const [weight, setWeight] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSave = async () => {
    // Validation
    if (weight <= 0) {
      setSaveError('Berat Sampah wajib diisi dan harus lebih dari 0')
      return
    }

    try {
      const entry = {
        userName,
        formType: 'input_sampah_kompos',
        weightKg: weight
      }

      await addEntry(entry)

      setSaveSuccess(true)
      setSaveError('')

      setTimeout(() => {
        setWeight(0)
        setSaveSuccess(false)
        navigate('/sampah')
      }, 2000)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }

  const isValid = weight > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Input Sampah ke Kompos</h1>
            <p className="page-subtitle">Catat berat sampah yang dimasukkan ke kompos</p>
          </div>
          <button
            onClick={() => navigate('/sampah')}
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

        {/* Berat Sampah Section */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Berat Sampah (kg)</label>
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
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

export default InputSampahKomposForm
