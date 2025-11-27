'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  CreditCard,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-xl font-bold">{profile?.fullName || 'User'}</h2>
          <p className="text-blue-100 text-sm mt-1">{profile?.email}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Business Info */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Business Information</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={<Building2 />} label="Business Name" value={profile?.businessName} />
            <InfoRow icon={<Mail />} label="Email" value={profile?.email} />
            <InfoRow icon={<Phone />} label="Phone" value={profile?.phone || 'Not set'} />
          </div>
        </div>

        {/* Payment Info */}
        {profile?.bankName && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Payment Information</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <InfoRow icon={<CreditCard />} label="Bank" value={profile.bankName} />
              <InfoRow icon={<CreditCard />} label="Account" value={profile.accountNumber} />
              <InfoRow icon={<CreditCard />} label="Account Name" value={profile.accountName} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <ActionButton
            icon={<Settings />}
            label="Settings"
            onClick={() => router.push('/dashboard/settings')}
          />
          <ActionButton
            icon={<LogOut />}
            label="Logout"
            onClick={handleLogout}
            danger
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
        danger ? 'text-red-600' : 'text-gray-900'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}
