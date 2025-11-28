'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, RotateCcw, Trash2, Calendar } from 'lucide-react';
import BottomNav from '@/components/dashboard/BottomNav';

interface SoldProperty {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  images: string[];
  status: string;
  sold_at: string;
  deleted_at: string | null;
  created_at: string;
}

export default function SoldPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<SoldProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSoldProperties();
  }, []);

  async function fetchSoldProperties() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'sold')
        .order('sold_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching sold properties:', error);
    } finally {
      setLoading(false);
    }
  }

  async function restoreProperty(id: string) {
    if (!confirm('Restore this property to available listings?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          status: 'available',
          sold_at: null,
          deleted_at: null,
        })
        .eq('id', id);

      if (error) throw error;
      alert('Property restored successfully');
      fetchSoldProperties();
    } catch (error) {
      console.error('Error restoring property:', error);
      alert('Failed to restore property');
    }
  }

  async function permanentlyDelete(id: string) {
    if (!confirm('Permanently delete this property? This cannot be undone!')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Property permanently deleted');
      fetchSoldProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  }

  const getDaysUntilCleanup = (soldAt: string) => {
    const soldDate = new Date(soldAt);
    const cleanupDate = new Date(soldDate);
    cleanupDate.setDate(cleanupDate.getDate() + 14);
    const today = new Date();
    const daysLeft = Math.ceil((cleanupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-blue-100 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Sold Properties</h1>
        <p className="text-blue-100 text-sm mt-1">{properties.length} sold properties</p>
      </div>

      <div className="p-4">
        {properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sold properties</h3>
            <p className="text-gray-600">Properties marked as sold will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const daysLeft = getDaysUntilCleanup(property.sold_at);
              const isDeleted = property.deleted_at !== null;
              
              return (
                <div key={property.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Home size={48} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No image</p>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                      SOLD
                    </div>
                    {isDeleted && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-full shadow-lg">
                        CLEANED UP
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                    {property.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{property.description}</p>
                    )}
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      ₦{property.price.toLocaleString()}
                    </p>
                    {property.location && (
                      <p className="text-sm text-gray-500 mb-3">{property.location}</p>
                    )}

                    {/* Sold Info */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Sold: {new Date(property.sold_at).toLocaleDateString()}</span>
                      </div>
                      {!isDeleted && daysLeft > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Images will be auto-deleted in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </p>
                      )}
                      {!isDeleted && daysLeft <= 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Images scheduled for cleanup
                        </p>
                      )}
                      {isDeleted && property.deleted_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Images cleaned up on {new Date(property.deleted_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreProperty(property.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => permanentlyDelete(property.id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
