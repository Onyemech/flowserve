'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Package, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  pendingOrders: number;
  completedOrders: number;
  activeListings: number;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topItems: { name: string; count: number; revenue: number }[];
  recentOrders: any[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?days=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === days
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Total Revenue</h2>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            ₦{analytics?.totalRevenue?.toLocaleString() || '0'}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">
              {analytics?.completedOrders || 0} completed orders
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            label="Customers"
            value={analytics?.totalCustomers || 0}
          />
          <StatCard
            icon={<Package className="w-5 h-5 text-purple-600" />}
            label="Active Listings"
            value={analytics?.activeListings || 0}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            label="Conversion"
            value={`${analytics?.conversionRate?.toFixed(1) || 0}%`}
          />
          <StatCard
            icon={<Package className="w-5 h-5 text-orange-600" />}
            label="Pending"
            value={analytics?.pendingOrders || 0}
          />
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-48 flex items-end justify-between gap-1">
            {analytics?.revenueByMonth?.map((item, index) => {
              const maxRevenue = Math.max(...(analytics.revenueByMonth?.map(m => m.revenue) || [1]));
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-all cursor-pointer relative group"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '2px' }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      ₦{item.revenue.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Top Selling Items</h2>
          <div className="space-y-3">
            {analytics?.topItems?.length ? (
              analytics.topItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.count} sales</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-bold">₦{item.revenue.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {analytics?.recentOrders?.length ? (
              analytics.recentOrders.slice(0, 5).map((order, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer_name || order.customer_phone}</p>
                    <p className="text-sm text-gray-500">{order.item_name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₦{parseFloat(order.amount).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
