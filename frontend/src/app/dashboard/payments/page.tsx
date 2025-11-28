'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  platform_fee: number;
  user_amount: number;
  payment_status: string;
  transfer_status: string;
  paystack_reference: string;
  created_at: string;
  paid_at?: string;
  transferred_at?: string;
  order?: {
    id: string;
    amount: number;
    status: string;
    customer: {
      name: string;
      phone_number: string;
    };
  };
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformFees: 0,
    netEarnings: 0,
    pendingTransfers: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const res = await fetch(`/api/payments?${params}`);
      const data = await res.json();

      if (res.ok) {
        setPayments(data.payments || []);
        calculateStats(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const totalRevenue = paymentsData
      .filter(p => p.payment_status === 'success')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const platformFees = paymentsData
      .filter(p => p.payment_status === 'success')
      .reduce((sum, p) => sum + Number(p.platform_fee), 0);

    const netEarnings = paymentsData
      .filter(p => p.payment_status === 'success')
      .reduce((sum, p) => sum + Number(p.user_amount), 0);

    const pendingTransfers = paymentsData
      .filter(p => p.payment_status === 'success' && p.transfer_status === 'pending')
      .reduce((sum, p) => sum + Number(p.user_amount), 0);

    setStats({ totalRevenue, platformFees, netEarnings, pendingTransfers });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      abandoned: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTransferStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getTransferStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-4">
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-blue-100 text-sm mt-1">Track your earnings and transfers</p>
      </div>

      <div className="p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-600">Total Revenue</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ₦{stats.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-gray-600">Net Earnings</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ₦{stats.netEarnings.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-xs text-gray-600">Platform Fees</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ₦{stats.platformFees.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-gray-600">Pending</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ₦{stats.pendingTransfers.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {['all', 'success', 'pending', 'failed'].map((status) => (
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

        {/* Payments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-600">No payments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {payment.order?.customer?.name || 'Unknown Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ref: {payment.paystack_reference}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                      payment.payment_status
                    )}`}
                  >
                    {payment.payment_status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">
                      ₦{Number(payment.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fee (5%)</p>
                    <p className="font-semibold text-orange-600">
                      -₦{Number(payment.platform_fee).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">You Get</p>
                    <p className="font-semibold text-green-600">
                      ₦{Number(payment.user_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {payment.payment_status === 'success' && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs font-medium ${getTransferStatusColor(payment.transfer_status)}`}>
                        {getTransferStatusIcon(payment.transfer_status)}
                        Transfer {payment.transfer_status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {payment.transferred_at
                        ? new Date(payment.transferred_at).toLocaleDateString()
                        : new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
