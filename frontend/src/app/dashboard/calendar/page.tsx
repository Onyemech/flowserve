'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function CalendarPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Calendar</h1>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-600 text-center py-8">
          Calendar page - Coming soon
        </p>
      </div>
    </div>
  )
}
