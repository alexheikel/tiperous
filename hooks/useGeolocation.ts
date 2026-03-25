// ============================================================
//  hooks/useGeolocation.ts — Browser geolocation
// ============================================================
'use client'
import { useState, useEffect } from 'react'

export interface Coords {
  lat: number
  lng: number
  accuracy: number
}

export function useGeolocation(autoFetch = false) {
  const [coords,  setCoords]  = useState<Coords | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function fetch() {
    if (!navigator.geolocation) {
      setError('Geolocalización no disponible en este dispositivo.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy })
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.code === 1 ? 'Permiso de ubicación denegado.' : 'No se pudo obtener ubicación.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  useEffect(() => { if (autoFetch) fetch() }, [])

  return { coords, error, loading, fetch }
}
