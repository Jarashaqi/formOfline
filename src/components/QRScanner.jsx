import React, { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const QRScanner = ({ onScanSuccess, onScanError, onClose }) => {
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    const elementId = 'qr-reader'
    
    // Create container element if it doesn't exist
    let container = document.getElementById(elementId)
    if (!container) {
      container = document.createElement('div')
      container.id = elementId
      container.style.width = '100%'
      container.style.height = '400px'
      container.style.margin = '0 auto'
      scannerRef.current.appendChild(container)
    }

    // Initialize QR code scanner
    html5QrCodeRef.current = new Html5Qrcode(elementId)

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    }

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      onScanSuccess(decodedText)
    }

    const qrCodeErrorCallback = (errorMessage) => {
      onScanError(errorMessage)
    }

    // Start scanning
    html5QrCodeRef.current
      .start({ facingMode: "environment" }, config, qrCodeSuccessCallback, qrCodeErrorCallback)
      .catch(err => {
        console.error("QR Code scanning failed:", err)
        onScanError(err.message)
      })

    // Cleanup function
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => {
          console.error("Failed to stop scanner:", err)
        })
      }
    }
  }, [onScanSuccess, onScanError])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <h2 className="text-lg font-semibold">📸 Scan QR Lokasi</h2>
        <button 
          onClick={onClose}
          className="text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Tutup
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div ref={scannerRef} className="w-full max-w-md"></div>
      </div>
      <div className="p-4 bg-black text-white text-center">
        <p className="text-sm">Arahkan kamera ke kode QR lokasi</p>
        <p className="text-xs mt-1 text-gray-300">Pastikan pencahayaan cukup</p>
      </div>
    </div>
  )
}

export default QRScanner