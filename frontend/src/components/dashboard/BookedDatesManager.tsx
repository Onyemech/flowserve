'use client'

import { useState } from 'react'
import { Calendar, X, Plus } from 'lucide-react'

interface BookedDatesManagerProps {
  bookedDates: string[]
  onChange: (dates: string[]) => void
}

export default function BookedDatesManager({ bookedDates, onChange }: BookedDatesManagerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  const addDate = () => {
    if (selectedDate && !bookedDates.includes(selectedDate)) {
      onChange([...bookedDates, selectedDate].sort())
      setSelectedDate('')
      setShowDatePicker(false)
    }
  }

  const removeDate = (dateToRemove: string) => {
    onChange(bookedDates.filter(date => date !== dateToRemove))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Booked Dates
        </label>
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Date
        </button>
      </div>

      {showDatePicker && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addDate}
              disabled={!selectedDate || bookedDates.includes(selectedDate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {bookedDates.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{bookedDates.length} date(s) marked as booked</p>
          <div className="flex flex-wrap gap-2">
            {bookedDates.map((date) => (
              <div
                key={date}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200"
              >
                <span>{formatDate(date)}</span>
                <button
                  type="button"
                  onClick={() => removeDate(date)}
                  className="hover:bg-red-100 rounded p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No booked dates yet. Add dates when this service is unavailable.</p>
      )}
    </div>
  )
}
