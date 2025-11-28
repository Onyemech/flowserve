'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, MapPin } from 'lucide-react';

interface BookedEvent {
  id: string;
  event_date: string;
  event_time?: string;
  guest_count?: number;
  event_location?: string;
  customer: {
    name: string;
    phone_number: string;
  };
  service?: {
    name: string;
  };
  amount: number;
  status: string;
  payment_status: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState<BookedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchBookedEvents();
  }, [currentDate]);

  const fetchBookedEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
      const data = await res.json();
      
      if (res.ok) {
        setBookedEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date: string) => {
    return bookedEvents.filter(event => event.event_date === date);
  };

  const isDateBooked = (date: string) => {
    return bookedEvents.some(event => 
      event.event_date === date && 
      ['pending', 'confirmed', 'processing'].includes(event.status)
    );
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isBooked = isDateBooked(dateStr);
    const isSelected = selectedDate === dateStr;
    const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
    
    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
        className={`aspect-square p-2 rounded-lg text-sm font-medium transition-all ${
          isSelected
            ? 'bg-blue-600 text-white'
            : isBooked
            ? 'bg-red-100 text-red-800 hover:bg-red-200'
            : isToday
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'hover:bg-gray-100 text-gray-900'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span>{day}</span>
          {isBooked && <div className="w-1 h-1 bg-red-600 rounded-full mt-1" />}
        </div>
      </button>
    );
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-4">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Event Calendar</h1>
            <p className="text-blue-100 text-sm mt-1">Manage your bookings</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded" />
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded" />
              <span className="text-gray-600">Booked</span>
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </h3>
            
            {selectedEvents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                ✅ No bookings for this date
              </p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/dashboard/orders/${event.id}`)}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{event.customer.name}</p>
                        <p className="text-sm text-gray-500">{event.service?.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {event.event_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.event_time}</span>
                        </div>
                      )}
                      {event.guest_count && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.guest_count} guests</span>
                        </div>
                      )}
                      {event.event_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.event_location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-gray-900">₦{Number(event.amount).toLocaleString()}</span>
                      <span className={`text-xs font-medium ${
                        event.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">This Month</p>
            <p className="text-2xl font-bold text-gray-900">
              {bookedEvents.filter(e => ['pending', 'confirmed', 'processing'].includes(e.status)).length}
            </p>
            <p className="text-xs text-gray-500">Bookings</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Revenue</p>
            <p className="text-xl font-bold text-green-600">
              ₦{bookedEvents
                .filter(e => e.payment_status === 'paid')
                .reduce((sum, e) => sum + Number(e.amount), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
