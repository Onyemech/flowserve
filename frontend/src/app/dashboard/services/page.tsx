'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Sparkles, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import BottomNav from '@/components/dashboard/BottomNav'

interface Service {
  id: string
  name: string
  price: number
  description: string
  category: string
  images: string[]
  status: string
  created_at: string
}

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Services</h1>
              <p className="text-purple-100 text-sm">{services.length} total</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/services/new')}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="p-4 space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-500 mb-6">Add your first service to get started</p>
            <button
              onClick={() => router.push('/dashboard/services/new')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              Add Service
            </button>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Service Image */}
              {service.images && service.images.length > 0 ? (
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  {service.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {service.images.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </div>
              )}

              {/* Service Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                    {service.category && (
                      <p className="text-sm text-gray-500 capitalize">{service.category}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {service.status}
                  </span>
                </div>

                <p className="text-2xl font-bold text-purple-600 mb-3">
                  ₦{service.price.toLocaleString()}
                </p>

                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
