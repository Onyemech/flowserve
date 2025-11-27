import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { config } from '../_shared/config.ts'
import { sendWhatsAppText } from '../_shared/whatsapp-sender.ts'
import { sendEmail } from '../_shared/email-sender.ts'
import { generateInvoiceHTML, generateInvoiceText } from '../_shared/invoice-generator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    // Verify signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(config.paystack.secretKey + body)
    )
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const event = JSON.parse(body)
    
    if (event.event !== 'charge.success') {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )

    const { reference, amount, customer } = event.data
    
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('paystack_reference', reference)
      .single()
    
    if (orderError || !order) {
      console.error('Order not found:', reference)
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Get business owner
    const { data: owner } = await supabase
      .from('flowserve_users')
      .select('*')
      .eq('id', order.user_id)
      .single()
    
    if (!owner) {
      throw new Error('Business owner not found')
    }
    
    // Get item details
    const tableName = order.order_type === 'property' ? 'properties' : 'services'
    const { data: item } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', order.item_id)
      .single()
    
    const itemName = item?.title || item?.name || 'Item'
    
    // Update order status
    await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
    
    // Initiate transfer to business owner
    try {
      const transferResponse = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: amount,
          recipient: owner.account_number,
          reason: `Payment for ${itemName}`,
        }),
      })
      
      const transferData = await transferResponse.json()
      
      await supabase
        .from('orders')
        .update({
          transfer_status: transferData.status ? 'completed' : 'failed',
          transfer_reference: transferData.data?.reference,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    } catch (transferError) {
      console.error('Transfer failed:', transferError)
      await supabase
        .from('orders')
        .update({
          transfer_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    }
    
    // Mark property as sold (NOT soft delete yet - that happens after 14 days)
    if (order.order_type === 'property') {
      await supabase
        .from('properties')
        .update({ status: 'sold' })
        .eq('id', order.item_id)
    }
    
    // Generate invoice
    const invoiceData = {
      invoiceNumber: `INV-${order.id.substring(0, 8).toUpperCase()}`,
      businessName: owner.business_name,
      customerName: order.customer_name || 'Customer',
      customerEmail: order.customer_email || '',
      customerPhone: order.customer_phone,
      itemName: itemName,
      amount: order.amount,
      paymentMethod: 'Paystack',
      date: new Date().toLocaleDateString(),
    }
    
    const invoiceHTML = generateInvoiceHTML(invoiceData)
    const invoiceText = generateInvoiceText(invoiceData)
    
    // Send WhatsApp confirmation
    const whatsappMessage = `✅ Payment Confirmed!\n\nThank you for your payment of ₦${order.amount.toLocaleString()}\n\nItem: ${itemName}\nInvoice: ${invoiceData.invoiceNumber}\n\nYour order is confirmed. ${owner.business_name} will contact you shortly.`
    
    await sendWhatsAppText(order.customer_phone, whatsappMessage)
    
    // Send email with invoice
    if (order.customer_email) {
      await sendEmail(
        order.customer_email,
        `Payment Confirmation - ${invoiceData.invoiceNumber}`,
        invoiceHTML,
        invoiceText
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
