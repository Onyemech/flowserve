import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, email, name } = body;

        if (!orderId || !email || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update order with customer details
        await supabase
            .from('orders')
            .update({
                customer_name: name,
                customer_email: email,
            })
            .eq('id', orderId);

        // Initialize Paystack transaction
        const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                amount: order.amount * 100, // Convert to kobo
                reference: orderId,
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/payment/callback`,
                metadata: {
                    order_id: orderId,
                    customer_name: name,
                },
            }),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            return NextResponse.json(
                { error: paystackData.message || 'Failed to initialize payment' },
                { status: 400 }
            );
        }

        // Update order with Paystack reference
        await supabase
            .from('orders')
            .update({ paystack_reference: paystackData.data.reference })
            .eq('id', orderId);

        return NextResponse.json({
            success: true,
            authorization_url: paystackData.data.authorization_url,
            reference: paystackData.data.reference,
        });
    } catch (error: any) {
        console.error('Paystack initialization error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
