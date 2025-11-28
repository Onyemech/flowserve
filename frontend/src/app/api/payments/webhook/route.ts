import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const reference = event.data.reference;
      const amount = event.data.amount / 100; // Convert from kobo

      // Find order by reference
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (order) {
        // Update order status
        await supabase
          .from('orders')
          .update({
            payment_status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        // If property, soft delete it
        if (order.order_type === 'property') {
          await supabase
            .from('properties')
            .update({
              status: 'sold',
              deleted_at: new Date().toISOString(),
            })
            .eq('id', order.item_id);
        }

        // TODO: Implement transfer to business owner
        // This requires creating a transfer recipient first
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
