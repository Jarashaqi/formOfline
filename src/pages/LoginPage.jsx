import React from 'react'
import { useNavigate } from 'react-router-dom'
import { setStoredUser } from '../utils/auth'

function LoginPage() {
  const navigate = useNavigate()
  
  const workers = ['Arya', 'Nurhadi', 'Fidini', 'Ahyando', 'Qonita']

  const handleWorkerSelect = (workerName) => {
    setStoredUser(workerName)
    navigate('/home', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4"><img src="" alt="" /></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pilih Pengguna</h1>
          <p className="text-gray-600">Silakan pilih nama Anda</p>
        </div>
        
        <div className="space-y-3">
          {workers.map((worker, index) => (
            <button
              key={index}
              onClick={() => handleWorkerSelect(worker)}
              className="w-full big-button big-button-primary"
            >
              {worker}
            </button>
          ))}
        </div>
        
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Waste Data Entry App</p>
          <p className="mt-1">Versi 1.0</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage