'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Home } from 'lucide-react';
import BottomNav from '@/components/dashboard/BottomNav';

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  images: string[];
  status: string;
  created_at: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  async function fetchProperties() {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProperty(id: string) {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  }

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Properties</h1>
            <p className="text-blue-100 text-sm mt-1">{properties.length} listings</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/properties/new')}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'available', 'sold'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first property listing</p>
            <button
              onClick={() => router.push('/dashboard/properties/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Add Property
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Home size={48} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No image</p>
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                      property.status === 'available'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {property.status}
                  </span>
                  {property.images && property.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                      +{property.images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                  {property.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{property.description}</p>
                  )}
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    ₦{property.price.toLocaleString()}
                  </p>
                  {property.location && (
                    <p className="text-sm text-gray-500 mb-4">{property.location}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      <Eye size={16} />
                      Details
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/properties/edit/${property.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProperty(property.id)}
                      className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
