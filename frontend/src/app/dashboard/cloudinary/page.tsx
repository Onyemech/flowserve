'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import { Cloud, HardDrive, Image, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface CloudinaryUsage {
  total_storage_mb: number;
  total_assets: number;
  last_updated: string;
}

interface CleanupLog {
  id: string;
  assets_deleted: number;
  storage_freed_mb: number;
  executed_at: string;
  status: string;
}

export default function CloudinaryTrackerPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<CloudinaryUsage | null>(null);
  const [cleanupLogs, setCleanupLogs] = useState<CleanupLog[]>([]);
  const [loading, setLoading] = useState(true);

  const FREE_TIER_LIMIT_MB = 25000; // 25GB Cloudinary free tier
  const FREE_TIER_ASSETS = 25000;

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cloudinary/usage');
      const data = await res.json();
      
      if (res.ok) {
        setUsage(data.usage);
        setCleanupLogs(data.cleanupLogs || []);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCleanupNow = async () => {
    if (!confirm('Run cleanup now? This will delete images from sold properties older than 14 days.')) return;

    try {
      const res = await fetch('/api/cloudinary/cleanup', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        alert(`Cleanup complete! Deleted ${data.deleted} assets, freed ${data.storage_freed_mb}MB`);
        fetchUsageData();
      } else {
        alert('Cleanup failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
      alert('Failed to run cleanup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const storagePercent = usage ? (usage.total_storage_mb / FREE_TIER_LIMIT_MB) * 100 : 0;
  const assetsPercent = usage ? (usage.total_assets / FREE_TIER_ASSETS) * 100 : 0;
  const storageRemaining = FREE_TIER_LIMIT_MB - (usage?.total_storage_mb || 0);
  const assetsRemaining = FREE_TIER_ASSETS - (usage?.total_assets || 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Cloud Storage</h1>
            <p className="text-blue-100 text-sm mt-1">Cloudinary usage tracker</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Storage Usage */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Storage Usage</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Used</span>
              <span className="text-sm font-medium text-gray-900">
                {usage?.total_storage_mb.toFixed(2) || 0} MB / {(FREE_TIER_LIMIT_MB / 1000).toFixed(0)} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  storagePercent > 80 ? 'bg-red-500' : storagePercent > 60 ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {storageRemaining.toFixed(0)} MB remaining ({(100 - storagePercent).toFixed(1)}%)
            </p>
          </div>

          {storagePercent > 80 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Storage Warning</p>
                <p className="text-xs text-red-700 mt-1">
                  You're using over 80% of your free tier. Consider running cleanup.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Assets Count */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Assets Count</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Assets</span>
              <span className="text-sm font-medium text-gray-900">
                {usage?.total_assets || 0} / {FREE_TIER_ASSETS.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  assetsPercent > 80 ? 'bg-red-500' : assetsPercent > 60 ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(assetsPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {assetsRemaining.toLocaleString()} assets remaining ({(100 - assetsPercent).toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Avg per Asset</p>
            <p className="text-xl font-bold text-gray-900">
              {usage && usage.total_assets > 0
                ? (usage.total_storage_mb / usage.total_assets).toFixed(2)
                : 0} MB
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">
              {usage?.last_updated
                ? new Date(usage.last_updated).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>

        {/* Cleanup Action */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Auto-Cleanup</h2>
          <p className="text-sm text-gray-600 mb-4">
            Images from sold properties are automatically deleted after 14 days to save storage.
          </p>
          <button
            onClick={runCleanupNow}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Run Cleanup Now
          </button>
        </div>

        {/* Cleanup History */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Cleanup History</h2>
          </div>
          
          {cleanupLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No cleanup history yet</p>
          ) : (
            <div className="space-y-3">
              {cleanupLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Deleted {log.assets_deleted} assets
                    </p>
                    <p className="text-xs text-gray-500">
                      Freed {log.storage_freed_mb}MB • {new Date(log.executed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Free Tier Limits</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Storage: 25 GB</li>
            <li>• Assets: 25,000 images</li>
            <li>• Bandwidth: 25 GB/month</li>
            <li>• Transformations: 25,000/month</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
