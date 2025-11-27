'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatNaira } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'

interface Property {
  id: string
  title: string
  price: number
  description: string
  location: string
  images: string[]
  status: string
  created_at: string
}

export default function PropertiesPage() {
  const { showToast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
    images: [] as string[],
  })

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
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

  const openModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property)
      setFormData({
        title: property.title,
        price: property.price.toString(),
        description: property.description || '',
        location: property.location || '',
        images: property.images || [],
      })
    } else {
      setEditingProperty(null)
      setFormData({
        title: '',
        price: '',
        description: '',
        location: '',
        images: [],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProperty(null)
    setFormData({
      title: '',
      price: '',
      description: '',
      location: '',
      images: [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.price) {
      showToast('error', 'Title and price are required')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const propertyData = {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        location: formData.location,
        images: formData.images,
      }

      if (editingProperty) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id)

        if (error) throw error
        showToast('success', 'Property updated successfully')
      } else {
        const { error } = await supabase
          .from('properties')
          .insert(propertyData)

        if (error) throw error
        showToast('success', 'Property added successfully')
      }

      closeModal()
      loadProperties()
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('soft_delete_property', {
        p_property_id: id
      })

      if (error) throw error
      showToast('success', 'Property deleted successfully')
      loadProperties()
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
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-gray-600 mt-1">Manage your real estate listings</p>
          </div>
          <Button onClick={() => openModal()} variant="primary">
            Add Property
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No properties yet</p>
            <Button onClick={() => openModal()} variant="primary">
              Add Your First Property
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                {property.images && property.images.length > 0 && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {property.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {formatNaira(property.price)}
                  </p>
                  {property.location && (
                    <p className="text-sm text-gray-600 mb-2">📍 {property.location}</p>
                  )}
                  {property.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {property.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-4">
                    Paystack fee: {formatNaira(calculatePaystackFee(property.price))}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openModal(property)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(property.id)}
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
          title={editingProperty ? 'Edit Property' : 'Add Property'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Property Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="3 Bedroom Flat in Lekki"
              required
            />

            <Input
              label="Price (₦)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="5000000"
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
                placeholder="Property details..."
              />
            </div>

            <Input
              label="Location (Optional)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Lekki Phase 1, Lagos"
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Images
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
                {editingProperty ? 'Update' : 'Add'} Property
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
