import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStoredUser, clearStoredUser } from '../utils/auth'

function HomePage() {
  const navigate = useNavigate()
  const userName = getStoredUser() || 'Petugas'

  const handleLogout = () => {
    clearStoredUser()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Halo, {userName}</h1>
            <p className="text-gray-600">Pilih area untuk catat data</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
          >
            Keluar
          </button>
        </div>

        {/* 3 tombol utama */}
        <div className="space-y-4 mb-6">
          <Link 
            to="/ayam" 
            className="block w-full big-button big-button-primary"
          >
            🐔 Area Ayam
          </Link>

          <Link 
            to="/sampah" 
            className="block w-full big-button big-button-secondary"
          >
            ♻️ Area Sampah
          </Link>

          <Link 
            to="/bsf" 
            className="block w-full big-button big-button-tertiary"
          >
            🪱 Area Maggot
          </Link>
        </div>

        {/* History kecil, terpisah */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800">
                Riwayat Entri
              </div>
              <div className="text-xs text-gray-500">
                Lihat semua data yang telah dicatat
              </div>
            </div>
            <Link
              to="/history"
              className="px-3 py-2 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
            >
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
