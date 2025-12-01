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
    whatsappConnected?: boolean;
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
        {/* WhatsApp Connection Banner */}
        {!data.user?.whatsappConnected && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Connect Your WhatsApp Business</h3>
                <p className="text-sm text-green-50 mb-3">
                  Enable AI-powered customer conversations and automated responses on your WhatsApp number.
                </p>
                <button
                  onClick={() => router.push('/dashboard/whatsapp-connect')}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect Now
                </button>
              </div>
            </div>
          </div>
        )}
        
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
