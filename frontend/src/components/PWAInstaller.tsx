'use client'
import { useEffect } from 'react'

export function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered')
            
            // Check for updates every 60 seconds
            setInterval(() => {
              registration.update()
            }, 60000)
          })
          .catch((error) => {
            console.error('SW registration failed:', error)
          })
      })
    }

    // Handle app updates - auto reload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Auto reload for new version
                window.location.reload()
              }
            })
          }
        })
      })
    }
  }, [])

  return null
}
