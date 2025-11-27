'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

function PaymentCreateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    const orderId = searchParams.get('order')
    if (!orderId) {
      showToast('error', 'Invalid payment link')
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error
      setSessionData(data)
      setFormData(prev => ({ 
        ...prev, 
        phone: data.customer_phone,
        email: data.customer_email || '',
      }))
    } catch (error: any) {
      showToast('error', error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone) {
      showToast('error', 'All fields are required')
      return
    }

    setIsLoading(true)

    try {
      if (!sessionData) {
        throw new Error('Order not found')
      }

      // Update order with customer details
      const supabase = createClient()
      await supabase
        .from('orders')
        .update({
          customer_name: formData.name,
          customer_email: formData.email,
        })
        .eq('id', sessionData.id)

      // Generate Paystack payment link
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          amount: sessionData.amount * 100, // Convert to kobo
          reference: sessionData.id,
          callback_url: `${window.location.origin}/payment/callback`,
        }),
      })

      const paystackData = await paystackResponse.json()

      if (!paystackData.status) {
        throw new Error(paystackData.message || 'Failed to create payment link')
      }

      // Update order with Paystack reference
      await supabase
        .from('orders')
        .update({ paystack_reference: paystackData.data.reference })
        .eq('id', sessionData.id)

      // Redirect to Paystack
      window.location.href = paystackData.data.authorization_url
    } catch (error: any) {
      showToast('error', error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="bg-white">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">Enter your details to proceed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08012345678"
              required
              disabled
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Proceed to Payment
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentCreateContent />
    </Suspense>
  )
}
