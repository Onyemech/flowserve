import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
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

    // Get orders for revenue calculation
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id);

    const totalRevenue = orders
      ?.filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0) || 0;

    // Get customer count from orders
    const uniqueCustomers = new Set(orders?.map(o => o.customer_phone) || []);
    const totalCustomers = uniqueCustomers.size;

    // Get active listings count
    const { data: userData } = await supabase
      .from('flowserve_users')
      .select('business_type')
      .eq('id', user.id)
      .single();

    let activeListings = 0;
    if (userData?.business_type === 'real_estate') {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'available')
        .is('deleted_at', null);
      activeListings = count || 0;
    } else {
      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      activeListings = count || 0;
    }

    return NextResponse.json({
      totalRevenue,
      totalCustomers,
      activeListings,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
