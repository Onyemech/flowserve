'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Mail,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  customer_id: string;
  item_type: 'property' | 'service';
  property_id: string | null;
  service_id: string | null;
  item_name: string | null;
  item_description: string | null;
  amount: number;
  status: string;
  payment_method: 'paystack' | 'manual' | null;
  payment_status: 'pending' | 'completed' | 'failed' | 'unpaid' | 'paid';
  payment_reference: string | null;
  paid_at: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  guest_count: number | null;
  customer?: {
    name: string;
    phone_number: string;
    email: string | null;
  };
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  async function fetchOrder() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers!orders_customer_id_fkey (
            name,
            phone_number,
            email
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function markAsReceived() {
    if (!order) return;

    setMarking(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'completed',
          paid_at: now,
          completed_at: now,
          updated_at: now,
        })
        .eq('id', order.id);

      if (error) throw error;

      // If it's a property, soft delete it
      if (order.item_type === 'property' && order.property_id) {
        await supabase
          .from('properties')
          .update({
            status: 'sold',
            deleted_at: now,
          })
          .eq('id', order.property_id);
      }

      alert('Payment marked as received! ✅');
      setShowConfirmDialog(false);
      fetchOrder();
    } catch (error: any) {
      console.error('Error marking payment:', error);
      alert('Failed to mark payment: ' + error.message);
    } finally {
      setMarking(false);
    }
  }

  async function markAsFailed() {
    if (!order) return;
    if (!confirm('Mark this payment as failed?')) return;

    setMarking(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      alert('Payment marked as failed');
      fetchOrder();
    } catch (error: any) {
      console.error('Error marking payment:', error);
      alert('Failed to update payment: ' + error.message);
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-blue-100 text-sm">Order #{order.id.slice(0, 8)}</p>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            order.payment_status === 'completed' ? 'bg-green-500 text-white' :
            order.payment_status === 'pending' ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Payment Status Alert */}
        {order.payment_method === 'manual' && order.payment_status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Manual Payment Pending</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Customer has been instructed to make manual payment. Verify payment receipt before marking as received.
                </p>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={marking}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Payment as Received
                </button>
              </div>
            </div>
          </div>
        )}

        {order.payment_status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Payment Received</h3>
                <p className="text-sm text-green-700">
                  This order has been paid and completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Customer Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{order.customer?.phone_number || 'N/A'}</p>
              </div>
            </div>
            {order.customer?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{order.customer.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Order Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Item Type</p>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                {order.item_type}
              </span>
            </div>
            {order.item_name && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Item Name</p>
                <p className="font-medium text-gray-900">{order.item_name}</p>
              </div>
            )}
            {order.item_description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 text-sm">{order.item_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Payment Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-gray-900">₦{order.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium text-gray-900 capitalize flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {order.payment_method}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-semibold capitalize ${
                order.payment_status === 'completed' ? 'text-green-600' :
                order.payment_status === 'pending' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {order.payment_status}
              </span>
            </div>
            {order.payment_reference && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Reference</span>
                <span className="font-mono text-sm text-gray-900">{order.payment_reference}</span>
              </div>
            )}
            {order.paid_at && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Paid At</span>
                <span className="text-sm text-gray-900">{new Date(order.paid_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Timeline
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.payment_status === 'pending' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={marking}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Mark as Received
              </button>
              <button
                onClick={markAsFailed}
                disabled={marking}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Mark as Failed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment Receipt</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you have received payment of <strong>₦{order.amount.toLocaleString()}</strong> from {order.customer?.name || order.customer?.phone_number}?
            </p>
            {order.item_type === 'property' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ This property will be marked as SOLD and moved to sold properties.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={marking}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={markAsReceived}
                disabled={marking}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {marking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
