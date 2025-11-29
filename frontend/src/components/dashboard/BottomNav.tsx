'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, User, Settings } from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();


  const navItems: NavItem[] = [
    {
      icon: <Home className="w-6 h-6" />,
      label: 'Home',
      path: '/dashboard',
    },
    {
      icon: <Package className="w-6 h-6" />,
      label: 'Orders',
      path: '/dashboard/orders',
    },
    {
      icon: <User className="w-6 h-6" />,
      label: 'Customers',
      path: '/dashboard/customers',
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: 'Settings',
      path: '/dashboard/settings',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
