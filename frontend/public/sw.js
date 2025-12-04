// FlowServe AI Service Worker - Network First Strategy
const CACHE_VERSION = '3.0.0' // Increment this to force update
const CACHE_NAME = `flowserve-v${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg',
  '/favicon.svg',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // DON'T skip waiting - let user decide when to update
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      return self.clients.claim() // Take control of all pages
    })
  )
})

// Fetch event - NETWORK FIRST, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip chrome extensions and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return

  // Skip API requests - always use network
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Only cache static assets and images
        if (
          event.request.url.includes('.svg') ||
          event.request.url.includes('.png') ||
          event.request.url.includes('.jpg') ||
          event.request.url.includes('.webp') ||
          event.request.url.includes('manifest.json')
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return response
      })
      .catch(() => {
        // Fallback to cache only when network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
      })
  )
})

// Message event - handle skip waiting and version check
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting, activating new version')
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION })
  }
})

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  if (!event.data) return

  try {
    const data = event.data.json()
    const title = data.title || 'FlowServe AI'
    const options = {
      body: data.body || '',
      icon: '/icon-192x192.svg',
      badge: '/icon-72x72.svg',
      data: {
        url: data.action_url || '/dashboard/notifications',
        notificationId: data.id,
      },
      tag: data.id || 'notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  } catch (error) {
    console.error('[SW] Error showing notification:', error)
  }
})

// Notification click event - navigate to action URL
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
