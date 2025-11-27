import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, order_type, item_id, customer_email, customer_phone } = body

    // Validate input
    if (!amount || !order_type || !item_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_phone,
        customer_email,
        order_type,
        item_id,
        amount,
        payment_method: 'paystack',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Generate Paystack payment link
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customer_email,
        amount: amount * 100, // Convert to kobo
        reference: order.id,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
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
      .eq('id', order.id)

    return NextResponse.json({
      payment_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    })
  } catch (error: any) {
    console.error('Payment link creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment link' },
      { status: 500 }
    )
  }
}
