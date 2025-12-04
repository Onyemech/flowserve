'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdateToast() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [showUpdate, setShowUpdate] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Mark as mounted to avoid hydration issues
        setMounted(true);
        
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        // Register service worker
        navigator.serviceWorker.register('/sw.js').then((reg) => {
            setRegistration(reg);

            // Check for updates every 60 seconds
            setInterval(() => {
                reg.update();
            }, 60000);

            // Listen for updates
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        console.log('[PWA] New version available');
                        setShowUpdate(true);
                    }
                });
            });
        }).catch((error) => {
            console.error('[PWA] Service worker registration failed:', error);
        });

        // Check if there's already a waiting service worker
        navigator.serviceWorker.ready.then((reg) => {
            if (reg.waiting) {
                console.log('[PWA] Update already waiting');
                setShowUpdate(true);
            }
        });

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] New service worker activated, reloading...');
            window.location.reload();
        });
    }, []);

    const handleUpdate = () => {
        if (!registration || !registration.waiting) {
            console.error('[PWA] No waiting service worker');
            return;
        }

        // Tell the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setShowUpdate(false);
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) return null;
    
    if (!showUpdate) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-down">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-2xl border border-blue-500 flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Update Available
                    </h3>
                    <p className="text-xs text-blue-100 mt-1">A new version is ready. Update now for the latest features!</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowUpdate(false)}
                        className="p-2 text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
                        aria-label="Dismiss update notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Update Now
                    </button>
                </div>
            </div>
        </div>
    );
}
