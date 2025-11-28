'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign, Home, Edit, Trash2 } from 'lucide-react';
import BottomNav from '@/components/dashboard/BottomNav';

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  images: string[];
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  property_type?: string;
  created_at: string;
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/properties/${params.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setProperty(data.property);
      } else {
        alert('Property not found');
        router.push('/dashboard/properties');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async () => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard/properties');
      } else {
        alert('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) return null;

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
        <h1 className="text-2xl font-bold">{property.title}</h1>
        <p className="text-blue-100 text-sm mt-1">Property Details</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <>
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={property.images[selectedImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                  {selectedImage + 1} / {property.images.length}
                </div>
              </div>
              {property.images.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-blue-600 scale-105'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <Home size={64} className="text-gray-400 mb-3" />
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

        {/* Price & Status */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Price</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {property.status}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₦{property.price.toLocaleString()}
          </p>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Property Details</h2>
          <div className="space-y-3">
            {property.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{property.location}</p>
                </div>
              </div>
            )}
            
            {(property.bedrooms || property.bathrooms || property.square_feet) && (
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                {property.bedrooms && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                    <p className="text-xs text-gray-500">Bedrooms</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                    <p className="text-xs text-gray-500">Bathrooms</p>
                  </div>
                )}
                {property.square_feet && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{property.square_feet}</p>
                    <p className="text-xs text-gray-500">Sq Ft</p>
                  </div>
                )}
              </div>
            )}

            {property.property_type && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Property Type</p>
                <p className="font-medium text-gray-900 capitalize">{property.property_type}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/dashboard/properties/edit/${property.id}`)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            <Edit className="w-5 h-5" />
            Edit Property
          </button>
          <button
            onClick={deleteProperty}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
