import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEntries } from '../utils/storage'

function BsfPage() {
  const navigate = useNavigate()

  const [stats, setStats] = React.useState({
    panenCount: 0,
    panenTotalKg: 0
  })

  React.useEffect(() => {
    async function loadStats() {
      const entries = await getEntries() || []
      const today = new Date().toISOString().slice(0, 10)

      const panenEntries = entries.filter(
        e => e.formType === 'panen_maggot' && (!e.date || e.date.slice(0, 10) === today || (e.createdAt && e.createdAt.slice(0, 10) === today))
      )

      const total = panenEntries.reduce(
        (sum, e) => sum + (e.weightKg || 0),
        0
      )

      setStats({
        panenCount: panenEntries.length,
        panenTotalKg: total
      })
    }
    loadStats()
  }, [])

  const { panenCount, panenTotalKg } = stats

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Area Maggot</h1>
            <p className="page-subtitle">Catat data panen maggot, pakan, kasgot, dan telur maggot</p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="big-button big-button-outline text-sm"
          >
            Kembali
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Ringkasan singkat */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-2 text-sm">
            Ringkasan Hari Ini
          </h2>
          <div className="grid-2">
            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500">Entri Panen</div>
              <div className="text-xl font-bold text-gray-900">
                {panenCount}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500">Total Panen</div>
              <div className="text-xl font-bold text-gray-900">
                {panenTotalKg.toFixed(1)} kg
              </div>
            </div>
          </div>
        </div>

        {/* Aksi di area BSF */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">
            Input Data
          </h2>
          <div className="space-y-3">
            <Link
              to="/panen-maggot"
              className="block w-full big-button big-button-primary"
            >
              🪱 Input Panen Maggot
            </Link>
            <Link
              to="/bsf-pakan"
              className="block w-full big-button big-button-secondary"
            >
              ♻️ Input Pakan Maggot
            </Link>
            <Link
              to="/panen-kasgot"
              className="block w-full big-button big-button-tertiary"
            >
              🧪 Panen Kasgot
            </Link>
            <Link
              to="/telur-maggot"
              className="block w-full big-button big-button-tertiary"
            >
              🥚 Telur Maggot
            </Link>
          </div>
        </div>

        {/* Link ke history detail */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Butuh lihat detail panen per lokasi / tipe?
            </div>
            <Link
              to="/history"
              className="px-3 py-2 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
            >
              Buka History
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BsfPage
