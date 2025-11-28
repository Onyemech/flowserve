'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';

interface Order {
  id: string;
  customer: {
    name: string;
    phone_number: string;
  };
  item_type: 'property' | 'service';
  property?: { title: string };
  service?: { name: string };
  amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      unpaid: 'text-red-600',
      paid: 'text-green-600',
      refunded: 'text-gray-600',
      failed: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-4">
        <h1 className="text-2xl font-bold">Orders & Bookings</h1>
        <p className="text-blue-100 text-sm mt-1">Manage your customer orders</p>
      </div>

      <div className="p-4">
        {/* Filters */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'].map((status) => (
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

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm p-4"
              >
                <div 
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{order.customer.name}</p>
                      <p className="text-sm text-gray-500">{order.customer.phone_number}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.item_type === 'property' ? order.property?.title : order.service?.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{order.item_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₦{Number(order.amount).toLocaleString()}</p>
                      <span className={`text-xs font-semibold capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    <span className="text-xs text-gray-500 capitalize">
                      {order.payment_method || 'N/A'}
                    </span>
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
