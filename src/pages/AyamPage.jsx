import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEntries } from '../utils/storage'

function AyamPage() {
  const navigate = useNavigate()

  const [stats, setStats] = React.useState({
    todayCount: 0,
    todayWeightGram: 0
  })

  React.useEffect(() => {
    async function loadStats() {
      const entries = await getEntries() || []
      const today = new Date().toISOString().slice(0, 10)

      const ayamEntries = entries.filter(
        e => e.formType === 'telur_harian' && e.date === today
      )

      const totalGram = ayamEntries.reduce(
        (sum, e) => sum + (e.totalWeightGram || 0),
        0
      )

      setStats({
        todayCount: ayamEntries.length,
        todayWeightGram: totalGram
      })
    }
    loadStats()
  }, [])

  const { todayCount, todayWeightGram } = stats

  const todayWeightKg = todayWeightGram / 1000

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Area Ayam</h1>
            <p className="page-subtitle">Pantau panen telur harian</p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="big-button big-button-outline text-sm"
          >
            Home
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
              <div className="text-xs text-gray-500">Entri Telur</div>
              <div className="text-xl font-bold text-gray-900">
                {todayCount}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500">Total Berat</div>
              <div className="text-xl font-bold text-gray-900">
                {todayWeightGram} g
              </div>
              <div className="text-[10px] text-gray-500">
                ≈ {todayWeightKg.toFixed(2)} kg
              </div>
            </div>
          </div>
        </div>

        {/* Aksi di area Ayam */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">
            Input Data
          </h2>
          <div className="space-y-3">
            <Link
              to="/telur-harian"
              className="block w-full big-button big-button-primary"
            >
              🥚 Panen Telur Harian
            </Link>
            <Link
              to="/panen-kohei"
              className="block w-full big-button big-button-secondary"
            >
              💩 Panen Kohei Ayam
            </Link>
            {/* nanti kalau ada form ayam lain, tinggal tambah di sini */}
          </div>
        </div>

        {/* Link ke history detail */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Butuh lihat detail per hari / kandang?
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

export default AyamPage
