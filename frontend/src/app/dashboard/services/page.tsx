'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatNaira } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'

interface Service {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  created_at: string
}

export default function ServicesPage() {
  const { showToast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: [] as string[],
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error)

        uploadedUrls.push(data.url)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

      showToast('success', `${uploadedUrls.length} image(s) uploaded`)
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        price: service.price.toString(),
        description: service.description || '',
        images: service.images || [],
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        price: '',
        description: '',
        images: [],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
    setFormData({
      name: '',
      price: '',
      description: '',
      images: [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      showToast('error', 'Name and price are required')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const serviceData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        images: formData.images,
      }

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)

        if (error) throw error
        showToast('success', 'Service updated successfully')
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData)

        if (error) throw error
        showToast('success', 'Service added successfully')
      }

      closeModal()
      loadServices()
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      showToast('success', 'Service deleted successfully')
      loadServices()
    } catch (error: any) {
      showToast('error', error.message)
    }
  }

  const calculatePaystackFee = (amount: number) => {
    return (amount * 0.015) + 100
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Services & Pricing</h1>
            <p className="text-gray-600 mt-1">Manage your event planning services</p>
          </div>
          <Button onClick={() => openModal()} variant="primary">
            Add Service
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No services yet</p>
            <Button onClick={() => openModal()} variant="primary">
              Add Your First Service
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                {service.images && service.images.length > 0 && (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {service.name}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {formatNaira(service.price)}
                  </p>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {service.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-4">
                    Paystack fee: {formatNaira(calculatePaystackFee(service.price))}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openModal(service)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(service.id)}
                      variant="danger"
                      size="sm"
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingService ? 'Edit Service' : 'Add Service'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Wedding Decoration"
              required
            />

            <Input
              label="Price (₦)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="150000"
              required
            />

            {formData.price && (
              <p className="text-sm text-gray-600">
                Paystack fee: {formatNaira(calculatePaystackFee(parseFloat(formData.price)))}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Service details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Sample Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {isUploading && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt="" className="w-full h-24 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={closeModal}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={isSubmitting}
              >
                {editingService ? 'Update' : 'Add'} Service
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
