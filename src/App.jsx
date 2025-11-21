import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SampahMasukForm from './pages/SampahMasukForm'
import PanenMaggotForm from './pages/PanenMaggotForm'
import TelurHarianForm from './pages/TelurHarianForm'
import BsfPakanForm from './pages/BsfPakanForm'
import PanenKoheiForm from './pages/PanenKoheiForm'
import SampahTerpilahForm from './pages/SampahTerpilahForm'
import HistoryPage from './pages/HistoryPage'
import PanenKasgotForm from './pages/PanenKasgotForm'
import SisaOrganikPupukForm from './pages/SisaOrganikPupukForm'
import AyamPage from './pages/AyamPage'
import SampahPage from './pages/SampahPage'
import BsfPage from './pages/BsfPage'
import { getStoredUser } from './utils/auth'
import './App.css'

function PrivateRoute({ children }) {
  const user = getStoredUser()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />

          {/* Area kategori */}
          <Route
            path="/ayam"
            element={
              <PrivateRoute>
                <AyamPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/panen-kohei"
            element={
              <PrivateRoute>
                <PanenKoheiForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/sampah"
            element={
              <PrivateRoute>
                <SampahPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/bsf"
            element={
              <PrivateRoute>
                <BsfPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/panen-kasgot"
            element={
              <PrivateRoute>
                <PanenKasgotForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/bsf-pakan"
            element={
              <PrivateRoute>
                <BsfPakanForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/sisa-organik-pupuk"
            element={
              <PrivateRoute>
                <SisaOrganikPupukForm />
              </PrivateRoute>
            }
          />

          {/* Form-form yang sudah ada */}
          <Route
            path="/sampah-masuk"
            element={
              <PrivateRoute>
                <SampahMasukForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/sampah-terpilah"
            element={
              <PrivateRoute>
                <SampahTerpilahForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/panen-maggot"
            element={
              <PrivateRoute>
                <PanenMaggotForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/telur-harian"
            element={
              <PrivateRoute>
                <TelurHarianForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            }
          />

          {/* default route */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
