'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'

export default function NewPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const data = await res.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages([...images, ...uploadedUrls])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.price) {
      alert('Please fill in required fields')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images,
        }),
      })

      if (!res.ok) throw new Error('Failed to create property')

      router.push('/dashboard/properties')
    } catch (error) {
      alert('Failed to create property')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Add Property</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Title */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., 3 Bedroom Flat in Lekki"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Price */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (₦) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="5000000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Lekki Phase 1, Lagos"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the property..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Property Images
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', url);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-red-100');
                    }}
                  />
                  {/* Fallback text if image fails (handled by onError hiding img) */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10 text-xs text-gray-400">
                    Loading...
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded z-10">
                      Cover Photo
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all">
            <div className="flex flex-col items-center justify-center py-6">
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Uploading images...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-1">Click to upload images</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                </>
              )}
            </div>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {images.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {images.length} image{images.length !== 1 ? 's' : ''} uploaded. First image will be the cover photo.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || uploading}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Property'
          )}
        </button>
      </form>
    </div>
  )
}
