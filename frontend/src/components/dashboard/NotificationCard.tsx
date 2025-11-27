'use client';

import { DollarSign, Headphones, UserPlus, Bell, Zap, Package, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  id: string;
  title: string;
  body: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  onClick?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  sales: <DollarSign className="w-6 h-6" />,
  support: <Headphones className="w-6 h-6" />,
  leads: <UserPlus className="w-6 h-6" />,
  system: <Bell className="w-6 h-6" />,
  automation: <Zap className="w-6 h-6" />,
  inventory: <Package className="w-6 h-6" />,
  task: <CheckCircle className="w-6 h-6" />,
  attendance: <Clock className="w-6 h-6" />,
};

const colorMap: Record<string, string> = {
  sales: 'bg-green-500',
  support: 'bg-blue-500',
  leads: 'bg-purple-500',
  system: 'bg-gray-500',
  automation: 'bg-yellow-500',
  inventory: 'bg-orange-500',
  task: 'bg-indigo-500',
  attendance: 'bg-teal-500',
};

export default function NotificationCard({
  id,
  title,
  body,
  type,
  category,
  isRead,
  createdAt,
  actionUrl,
  onClick,
}: NotificationCardProps) {
  const icon = iconMap[category] || iconMap.system;
  const bgColor = colorMap[category] || colorMap.system;

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-4 border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer ${
        !isRead ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <div className={`${bgColor} text-white rounded-full p-2 flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{title}</h3>
          {!isRead && (
            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{body}</p>
        <p className="text-gray-400 text-xs mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
