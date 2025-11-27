'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Card } from '@/components/ui/Card'
import { formatNaira } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  order_type: string
  amount: number
  payment_method: string
  payment_status: string
  transfer_status: string
  created_at: string
}

export default function OrdersPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmManualPayment = async (orderId: string) => {
    if (!confirm('Confirm that you have received payment for this order?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) throw error

      showToast('success', 'Payment confirmed successfully')
      loadOrders()

      // TODO: Send WhatsApp confirmation to customer
      // TODO: If property order, soft delete the property
    } catch (error: any) {
      showToast('error', error.message)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'pending') return order.payment_status === 'pending'
    if (filter === 'completed') return order.payment_status === 'completed'
    return true
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Orders & Payments</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and payments</p>
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
          >
            All Orders
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'primary' : 'outline'}
            size="sm"
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter('completed')}
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="sm"
          >
            Completed
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">No orders found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {order.customer_name || 'Customer'}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {order.payment_method}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p>📞 {order.customer_phone}</p>
                        {order.customer_email && <p>📧 {order.customer_email}</p>}
                      </div>
                      <div>
                        <p>Type: {order.order_type === 'property' ? 'Property' : 'Service'}</p>
                        <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-2xl font-bold text-primary">
                        {formatNaira(order.amount)}
                      </p>
                    </div>

                    {order.transfer_status && (
                      <p className="text-sm text-gray-600 mt-2">
                        Transfer: <span className="font-medium">{order.transfer_status}</span>
                      </p>
                    )}
                  </div>

                  {order.payment_method === 'manual' && order.payment_status === 'pending' && (
                    <Button
                      onClick={() => confirmManualPayment(order.id)}
                      variant="primary"
                      size="sm"
                    >
                      Confirm Payment
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter(o => o.payment_status === 'pending').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              {formatNaira(orders.filter(o => o.payment_status === 'completed').reduce((sum, o) => sum + o.amount, 0))}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
