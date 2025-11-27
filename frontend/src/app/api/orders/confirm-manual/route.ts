import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get business owner details
    const { data: owner } = await supabase
      .from('flowserve_users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get item details
    const tableName = order.order_type === 'property' ? 'properties' : 'services'
    const { data: item } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', order.item_id)
      .single()

    const itemName = item?.title || item?.name || 'Item'

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    if (updateError) throw updateError

    // Mark property as sold (NOT soft delete yet - that happens after 14 days)
    if (order.order_type === 'property') {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ status: 'sold' })
        .eq('id', order.item_id)

      if (updateError) {
        console.error('Failed to mark property as sold:', updateError)
      }
    }

    // Call edge function to send notifications
    const edgeResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-payment-confirmation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: order.id,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        amount: order.amount,
        item_name: itemName,
        business_name: owner?.business_name,
        payment_method: 'Manual Payment',
      }),
    })

    if (!edgeResponse.ok) {
      console.error('Failed to send notifications')
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
    })
  } catch (error: any) {
    console.error('Manual payment confirmation error:', error)
    return NextResponse.json(
      { error: error.message || 'Confirmation failed' },
      { status: 500 }
    )
  }
}
