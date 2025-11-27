import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { sendWhatsAppText } from '../_shared/whatsapp-sender.ts'
import { sendEmail } from '../_shared/email-sender.ts'
import { generateInvoiceHTML, generateInvoiceText } from '../_shared/invoice-generator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      order_id,
      customer_phone,
      customer_email,
      customer_name,
      amount,
      item_name,
      business_name,
      payment_method,
    } = await req.json()

    // Generate invoice
    const invoiceData = {
      invoiceNumber: `INV-${order_id.substring(0, 8).toUpperCase()}`,
      businessName: business_name,
      customerName: customer_name || 'Customer',
      customerEmail: customer_email || '',
      customerPhone: customer_phone,
      itemName: item_name,
      amount: amount,
      paymentMethod: payment_method,
      date: new Date().toLocaleDateString(),
    }

    const invoiceHTML = generateInvoiceHTML(invoiceData)
    const invoiceText = generateInvoiceText(invoiceData)

    // Send WhatsApp confirmation
    const whatsappMessage = `✅ Payment Confirmed!\n\nThank you for your payment of ₦${amount.toLocaleString()}\n\nItem: ${item_name}\nInvoice: ${invoiceData.invoiceNumber}\n\nYour order is confirmed. ${business_name} will contact you shortly.`

    await sendWhatsAppText(customer_phone, whatsappMessage)

    // Send email with invoice
    if (customer_email) {
      await sendEmail(
        customer_email,
        `Payment Confirmation - ${invoiceData.invoiceNumber}`,
        invoiceHTML,
        invoiceText
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
