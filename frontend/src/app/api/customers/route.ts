import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get customers for this user
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ customers: customers || [] });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone_number, email } = body;

    if (!name || !phone_number) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    // Auto-generate WhatsApp ID from phone number (remove + and spaces)
    const whatsapp_id = phone_number.replace(/[\s+\-()]/g, '');

    // Check if customer already exists
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .eq('phone_number', phone_number)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        name,
        phone_number,
        email: email || null,
        whatsapp_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
