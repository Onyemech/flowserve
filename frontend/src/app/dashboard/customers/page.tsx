'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/dashboard/BottomNav';

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  whatsapp_id?: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      const data = await res.json();
      
      if (res.ok) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Customer added successfully');
        setShowAddModal(false);
        setFormData({ name: '', phone_number: '', email: '' });
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-blue-100 text-sm mt-1">Manage your customer database</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-600">No customers yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Customer
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{customer.phone_number}</p>
                    {customer.email && (
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="customer@example.com"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
