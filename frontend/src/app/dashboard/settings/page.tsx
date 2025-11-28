'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Bot, 
  User, 
  CreditCard, 
  Bell, 
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react';
import BottomNav from '@/components/dashboard/BottomNav';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('flowserve_users')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const settingsMenu = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'WhatsApp Bot',
      description: 'Configure your AI agent',
      path: '/dashboard/bot-settings',
      badge: profile?.whatsapp_connected ? 'Active' : null,
      badgeColor: 'bg-green-100 text-green-800',
    },
    {
      icon: <User className="w-6 h-6" />,
      title: 'Profile',
      description: 'Manage your account details',
      path: '/dashboard/profile',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Payment Settings',
      description: 'Bank account & Paystack',
      path: '/dashboard/payments',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Notifications',
      description: 'Manage notification preferences',
      path: '/dashboard/notifications',
    },
  ];

  if (loading) {
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
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <p className="text-blue-100 text-sm">Manage your account and preferences</p>
      </div>

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">{profile?.full_name || 'User'}</h2>
              <p className="text-sm text-gray-600">{profile?.business_name || 'Business'}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{profile?.business_type?.replace('_', ' ') || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {settingsMenu.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white p-4 rounded-2xl font-semibold hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>FlowServe AI v1.0.0</p>
          <p className="mt-1">© 2025 All rights reserved</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
