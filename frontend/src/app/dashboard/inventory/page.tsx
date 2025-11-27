'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/dashboard/BottomNav';
import { ArrowLeft, Plus, Home, Calendar, Search } from 'lucide-react';

export default function InventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setBusinessType(data.businessType);
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRealEstate = businessType === 'real_estate';
  const title = isRealEstate ? 'Properties' : 'Services';
  const addLabel = isRealEstate ? 'Add Property' : 'Add Service';

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <button
            onClick={() => router.push(isRealEstate ? '/dashboard/properties/new' : '/dashboard/services/new')}
            className="p-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            {isRealEstate ? (
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            ) : (
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {title.toLowerCase()} yet
            </h3>
            <p className="text-gray-500 mb-4">Start by adding your first {isRealEstate ? 'property' : 'service'}</p>
            <button
              onClick={() => router.push(isRealEstate ? '/dashboard/properties/new' : '/dashboard/services/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all"
            >
              {addLabel}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isRealEstate={isRealEstate}
                onClick={() => router.push(`/dashboard/${isRealEstate ? 'properties' : 'services'}/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function ItemCard({ item, isRealEstate, onClick }: any) {
  const title = item.title || item.name;
  const price = item.price;
  const image = item.images?.[0];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden active:scale-98 transition-all cursor-pointer"
    >
      <div className="flex gap-4 p-4">
        {image && (
          <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{title}</h3>
          <p className="text-blue-600 font-bold text-lg mb-2">₦{parseFloat(price).toLocaleString()}</p>
          {item.location && (
            <p className="text-sm text-gray-500 truncate">{item.location}</p>
          )}
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
