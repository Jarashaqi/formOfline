import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/auth'
import { addEntry } from '../utils/storage'

const FEED_STEP_GRAM = 50

// Daftar box / tray BSF (nanti bisa kamu ganti sesuai real di lapangan)
const BSF_BOXES = [
  { id: 'BSF-BOX-01', name: 'Box 01 - Rak 1' },
  { id: 'BSF-BOX-02', name: 'Box 02 - Rak 1' },
  { id: 'BSF-BOX-03', name: 'Box 03 - Rak 2' },
  { id: 'BSF-BOX-04', name: 'Box 04 - Rak 2' },
]

function BsfPakanForm() {
  const navigate = useNavigate()
  const userName = getStoredUser()

  // Waktu sekarang (hanya ditampilkan, tidak diedit)
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

  const [selectedBoxId, setSelectedBoxId] = useState('')
  const [selectedBoxName, setSelectedBoxName] = useState('')

  const [feedWeightGram, setFeedWeightGram] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleBoxChange = (e) => {
    const value = e.target.value
    setSelectedBoxId(value)

    const box = BSF_BOXES.find(b => b.id === value)
    setSelectedBoxName(box ? box.name : '')
  }

  const handleWeightInputChange = (e) => {
    const value = e.target.value
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 0) {
      setFeedWeightGram(0)
    } else {
      setFeedWeightGram(num)
    }
  }

  const changeWeightByStep = (delta) => {
    setFeedWeightGram(prev => {
      const next = (prev || 0) + delta
      return next < 0 ? 0 : next
    })
  }

  const handleSave = () => {
    if (!selectedBoxId) {
      setSaveError('Harap pilih box BSF yang diberi makan')
      return
    }

    if (feedWeightGram <= 0) {
      setSaveError('Berat pakan harus lebih dari 0 gram')
      return
    }

    try {
      const entry = {
        userName,
        formType: 'bsf_pakan',
        date: todayIso,
        bsfBoxId: selectedBoxId,
        bsfBoxName: selectedBoxName,
        feedWeightGram
        // createdAt, id, dll biasanya ditambah di addEntry / storage utils
      }

      addEntry(entry)

      setSaveSuccess(true)
      setSaveError('')

      setTimeout(() => {
        setSaveSuccess(false)
        // reset form kecil
        setSelectedBoxId('')
        setSelectedBoxName('')
        setFeedWeightGram(0)
        navigate('/bsf')
      }, 1500)
    } catch (error) {
      setSaveError('Gagal menyimpan entri: ' + error.message)
    }
  }

  const isValid = selectedBoxId && feedWeightGram > 0
  const feedWeightKg = feedWeightGram / 1000

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Pakan BSF (Organik)</h1>
            <p className="page-subtitle">
              Catat pemberian pakan organik ke box BSF
            </p>
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
        {/* Info umum: kapan & siapa */}
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
            ✓ Data pakan BSF berhasil disimpan!
          </div>
        )}

        {saveError && (
          <div className="card bg-red-50 border-red-200 text-red-800">
            ✗ {saveError}
          </div>
        )}

        {/* Box BSF */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">📦 Box / Tray BSF</label>
            <select
              value={selectedBoxId}
              onChange={handleBoxChange}
              className="form-input"
            >
              <option value="">Pilih box BSF...</option>
              {BSF_BOXES.map(box => (
                <option key={box.id} value={box.id}>
                  {box.name} ({box.id})
                </option>
              ))}
            </select>

            {selectedBoxName && (
              <div className="mt-3 text-xs text-gray-600">
                Box terpilih: <span className="font-medium">{selectedBoxName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Berat pakan */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">⚖️ Berat Pakan Organik (gram)</label>
            <div className="weight-controls">
              <button
                className="weight-btn minus"
                onClick={() => changeWeightByStep(-FEED_STEP_GRAM)}
                disabled={feedWeightGram <= 0}
              >
                -
              </button>

              <input
                type="number"
                min="0"
                className="form-input"
                style={{ maxWidth: '140px', textAlign: 'center' }}
                value={feedWeightGram}
                onChange={handleWeightInputChange}
                inputMode="numeric"
              />

              <button
                className="weight-btn plus"
                onClick={() => changeWeightByStep(FEED_STEP_GRAM)}
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Step: {FEED_STEP_GRAM} gram | Perkiraan: {feedWeightKg.toFixed(2)} kg
            </div>
          </div>
        </div>

        {/* Ringkasan singkat */}
        {isValid && (
          <div className="card">
            <div className="text-sm text-gray-700 mb-1 font-medium">
              Ringkasan Cepat
            </div>
            <div className="text-xs text-gray-600">
              Box: <strong>{selectedBoxName || selectedBoxId}</strong>
            </div>
            <div className="text-xs text-gray-600">
              Berat pakan: <strong>{feedWeightGram} g</strong> (~{feedWeightKg.toFixed(2)} kg)
            </div>
          </div>
        )}

        {/* Tombol simpan */}
        <div className="p-4">
          <button 
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full big-button ${
              isValid 
                ? 'big-button-primary' 
                : 'big-button-tertiary'
            }`}
          >
            SIMPAN PAKAN BSF
          </button>
        </div>
      </div>
    </div>
  )
}

export default BsfPakanForm
