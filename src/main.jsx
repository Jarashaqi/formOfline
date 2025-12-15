import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import * as db from './utils/db'

// Explicit migration invocation - run once at app start
// Idempotent: migration check sendiri apakah sudah di-run
db.migrateFromLocalStorage().catch(err => {
  console.error('Migration error (non-fatal):', err)
  // Don't block app startup if migration fails
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
