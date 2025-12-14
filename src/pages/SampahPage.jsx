import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEntries } from '../utils/storage'

function SampahPage() {
  const navigate = useNavigate()

  const [stats, setStats] = React.useState({
    masukKg: 0,
    organikKg: 0,
    nonOrganikKg: 0
  })

  React.useEffect(() => {
    async function loadStats() {
      const entries = await getEntries() || []
      const today = new Date().toISOString().slice(0, 10)

      let masuk = 0
      let organik = 0
      let nonOrganik = 0

      entries.forEach(e => {
        const createdDay = e.createdAt ? e.createdAt.slice(0, 10) : null
        const isToday = createdDay === today || e.date === today

        if (!isToday) return

        if (e.formType === 'sampah_masuk') {
          masuk += e.weightKg || 0
        }
        if (e.formType === 'sampah_terpilah') {
          organik += e.organicKg || 0
          nonOrganik += e.inorganicKg || 0
        }
      })

      setStats({
        masukKg: masuk,
        organikKg: organik,
        nonOrganikKg: nonOrganik
      })
    }
    loadStats()
  }, [])

  const { masukKg, organikKg, nonOrganikKg } = stats

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Area Sampah</h1>
            <p className="page-subtitle">Pantau sampah masuk & terpilah</p>
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
          <div className="grid-3">
            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500">Sampah Masuk</div>
              <div className="text-xl font-bold text-gray-900">
                {masukKg.toFixed(1)} kg
              </div>
            </div>
            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500">Organik</div>
              <div className="text-xl font-bold text-gray-900">
                {organikKg.toFixed(1)} kg
              </div>
            </div>
            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500">Non Organik</div>
              <div className="text-xl font-bold text-gray-900">
                {nonOrganikKg.toFixed(1)} kg
              </div>
            </div>
          </div>
        </div>

        {/* Aksi di area Sampah */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">
            Input Data
          </h2>
          <div className="space-y-3">
            <Link
              to="/sampah-masuk"
              className="block w-full big-button big-button-primary"
            >
              📥 Input Sampah Masuk
            </Link>
            <Link
              to="/sampah-terpilah"
              className="block w-full big-button big-button-secondary"
            >
              ♻️ Input Sampah Terpilah
            </Link>
          </div>
        </div>

        {/* Link ke history detail */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Butuh lihat detail per lokasi / shift?
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

export default SampahPage
