import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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
      const { reference, amount, customer } = event.data;

      const supabase = await createClient();

      // Find the payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*, orders(*, users(*))')
        .eq('paystack_reference', reference)
        .single();

      if (paymentError || !payment) {
        console.error('Payment not found:', reference);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'success',
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Update order payment status
      await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', payment.order_id);

      // Auto-transfer to admin account
      await initiateTransfer(payment);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function initiateTransfer(payment: any) {
  try {
    const user = payment.orders.users;
    
    if (!user.bank_code || !user.account_number) {
      console.error('User bank details not found');
      return;
    }

    // Calculate transfer amount (deduct platform fee if needed)
    const platformFee = payment.amount * 0.05; // 5% platform fee
    const transferAmount = payment.amount - platformFee;

    // Create transfer recipient
    const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name: user.full_name,
        account_number: user.account_number,
        bank_code: user.bank_code,
        currency: 'NGN',
      }),
    });

    const recipientData = await recipientResponse.json();

    if (!recipientData.status) {
      throw new Error('Failed to create transfer recipient');
    }

    // Initiate transfer
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: transferAmount * 100, // Convert to kobo
        recipient: recipientData.data.recipient_code,
        reason: `Payment for order ${payment.order_id}`,
      }),
    });

    const transferData = await transferResponse.json();

    if (transferData.status) {
      const supabase = await createClient();
      await supabase
        .from('payments')
        .update({
          transfer_status: 'transferred',
          transfer_reference: transferData.data.transfer_code,
          transferred_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
    }
  } catch (error) {
    console.error('Transfer error:', error);
    
    const supabase = await createClient();
    await supabase
      .from('payments')
      .update({ transfer_status: 'failed' })
      .eq('id', payment.id);
  }
}
