'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MessageCircle, ShoppingBag, Phone, Mail } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  created_at: string;
}

interface Order {
  id: string;
  item_name: string;
  amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  async function fetchCustomerData() {
    try {
      // Get customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', params.id)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Get orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', params.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Failed to load customer');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className=\"flex items-center justify-center min-h-screen\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600\"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className=\"p-6\">
        <p>Customer not found</p>
      </div>
    );
  }

  const totalSpent = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className=\"p-6 max-w-6xl mx-auto\">
      <button
        onClick={() => router.back()}
        className=\"flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6\"
      >
        <ArrowLeft size={20} />
        Back to Customers
      </button>

      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
        {/* Customer Info */}
        <div className=\"lg:col-span-1\">
          <div className=\"bg-white rounded-lg shadow p-6\">
            <div className=\"flex items-center justify-center mb-4\">
              <div className=\"w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center\">
                <span className=\"text-3xl font-bold text-blue-600\">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <h2 className=\"text-2xl font-bold text-gray-900 text-center mb-2\">
              {customer.name}
            </h2>

            <div className=\"space-y-3 mt-6\">
              <div className=\"flex items-center gap-3 text-gray-600\">
                <Phone size={20} />
                <span>{customer.phone_number}</span>
              </div>

              {customer.email && (
                <div className=\"flex items-center gap-3 text-gray-600\">
                  <Mail size={20} />
                  <span>{customer.email}</span>
                </div>
              )}

              <div className=\"flex items-center gap-3 text-gray-600\">
                <ShoppingBag size={20} />
                <span>{orders.length} orders</span>
              </div>
            </div>

            <div className=\"mt-6 pt-6 border-t\">
              <p className=\"text-sm text-gray-500 mb-1\">Total Spent</p>
              <p className=\"text-2xl font-bold text-blue-600\">
                ₦{totalSpent.toLocaleString()}
              </p>
            </div>

            <div className=\"mt-6 pt-6 border-t\">
              <p className=\"text-sm text-gray-500 mb-1\">Customer Since</p>
              <p className=\"text-lg font-semibold text-gray-900\">
                {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => window.open(`https://wa.me/${customer.phone_number.replace(/\\D/g, '')}`)}
              className=\"w-full mt-6 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700\"
            >
              <MessageCircle size={20} />
              Message on WhatsApp
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className=\"lg:col-span-2\">
          <div className=\"bg-white rounded-lg shadow p-6\">
            <h3 className=\"text-xl font-bold text-gray-900 mb-6\">Order History</h3>

            {orders.length === 0 ? (
              <div className=\"text-center py-12\">
                <ShoppingBag size={48} className=\"mx-auto text-gray-400 mb-4\" />
                <p className=\"text-gray-600\">No orders yet</p>
              </div>
            ) : (
              <div className=\"space-y-4\">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className=\"border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition\"
                  >
                    <div className=\"flex items-start justify-between mb-2\">
                      <div className=\"flex-1\">
                        <h4 className=\"font-semibold text-gray-900\">{order.item_name}</h4>
                        <p className=\"text-sm text-gray-500\">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className=\"text-lg font-bold text-blue-600\">
                        ₦{order.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className=\"flex gap-2\">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
