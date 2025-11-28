import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, customerPhone } = await request.json();

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*, customers(name), flowserve_users!orders_user_id_fkey(business_name)')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Send WhatsApp message
    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (whatsappToken && phoneNumberId) {
      const message = `✅ Payment Confirmed!\\n\\nYour payment of ₦${order.amount.toLocaleString()} has been received and confirmed.\\n\\nOrder: ${order.item_name}\\n\\nThank you for your business! ${order.flowserve_users.business_name} will be in touch shortly.`;

      await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: customerPhone,
          type: 'text',
          text: { body: message }
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Failed to send confirmation' }, { status: 500 });
  }
}
