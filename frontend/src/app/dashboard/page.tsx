'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Bell,
  Plus,
  Home as HomeIcon,
  Calendar,
  UserCircle,
  LogOut
} from 'lucide-react';

interface DashboardData {
  businessType: string;
  metrics: {
    totalSales: number;
    totalLeads: number;
    conversionRate: number;
    revenue: number;
    activeCustomers: number;
    pendingOrders: number;
  };
  recentActivity: any[];
  user: {
    fullName: string;
    businessName: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      } else if (res.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      if (res.ok) {
        const { count } = await res.json();
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isRealEstate = data.businessType === 'real_estate';
  const isEventPlanning = data.businessType === 'event_planning';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{data.user?.businessName || 'My Business'}</h1>
            <p className="text-blue-100 text-sm mt-1">Welcome back, {data.user?.fullName || 'User'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="relative p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <UserCircle className="w-6 h-6" />
              </button>
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/dashboard/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <UserCircle className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-300" />
              <span className="text-sm text-blue-100">Revenue</span>
            </div>
            <p className="text-2xl font-bold">₦{data.metrics.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-300" />
              <span className="text-sm text-blue-100">
                {isRealEstate ? 'Leads' : 'Bookings'}
              </span>
            </div>
            <p className="text-2xl font-bold">{data.metrics.totalLeads}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            label="Conversion"
            value={`${data.metrics.conversionRate}%`}
            bgColor="bg-blue-50"
          />
          <MetricCard
            icon={<Package className="w-5 h-5 text-orange-600" />}
            label={isRealEstate ? 'Properties' : 'Services'}
            value={data.metrics.pendingOrders.toString()}
            bgColor="bg-orange-50"
          />
          <MetricCard
            icon={<Users className="w-5 h-5 text-green-600" />}
            label="Customers"
            value={data.metrics.activeCustomers.toString()}
            bgColor="bg-green-50"
          />
          <MetricCard
            icon={<DollarSign className="w-5 h-5 text-purple-600" />}
            label="Total Sales"
            value={data.metrics.totalSales.toString()}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              icon={<Plus className="w-5 h-5" />}
              label={isRealEstate ? 'Add Property' : 'Add Service'}
              onClick={() => router.push(isRealEstate ? '/dashboard/properties/new' : '/dashboard/services/new')}
            />
            <ActionButton
              icon={<Package className="w-5 h-5" />}
              label="Orders"
              onClick={() => router.push('/dashboard/orders')}
            />
            {isEventPlanning && (
              <ActionButton
                icon={<Calendar className="w-5 h-5" />}
                label="Calendar"
                onClick={() => router.push('/dashboard/calendar')}
              />
            )}
            {isRealEstate && (
              <ActionButton
                icon={<HomeIcon className="w-5 h-5" />}
                label="Properties"
                onClick={() => router.push('/dashboard/properties')}
              />
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3">Recent Activity</h2>
          {!data.recentActivity || data.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function MetricCard({ icon, label, value, bgColor }: any) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all active:scale-95"
    >
      <div className="p-3 bg-blue-600 text-white rounded-full">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </button>
  );
}

function ActivityItem({ activity }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );
}
