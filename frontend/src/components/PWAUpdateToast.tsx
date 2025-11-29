'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdateToast() {
    const [wb, setWb] = useState<any>(null);
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            // @ts-ignore
            window.workbox !== undefined
        ) {
            // @ts-ignore
            const wbInstance = window.workbox;
            setWb(wbInstance);

            const promptNewVersionAvailable = () => {
                setShowUpdate(true);
            };

            wbInstance.addEventListener('waiting', promptNewVersionAvailable);
            wbInstance.register();
        }
    }, []);

    const handleUpdate = () => {
        if (wb) {
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });
            wb.messageSkipWaiting();
        }
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-700 flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">Update Available</h3>
                    <p className="text-xs text-gray-400 mt-0.5">A new version of the app is ready.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowUpdate(false)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
