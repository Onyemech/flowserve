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

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('flowserve_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const businessType = userData.business_type;

    // Get metrics based on business type
    let metrics = {
      totalSales: 0,
      totalLeads: 0,
      conversionRate: 0,
      revenue: 0,
      activeCustomers: 0,
      pendingOrders: 0,
    };

    // Get orders/sales data
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id);

    if (orders) {
      metrics.totalSales = orders.filter(o => o.payment_status === 'completed').length;
      metrics.revenue = orders
        .filter(o => o.payment_status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0);
      metrics.pendingOrders = orders.filter(o => o.payment_status === 'pending').length;
    }

    // Get WhatsApp sessions as leads
    const { data: sessions } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', user.id);

    if (sessions) {
      metrics.totalLeads = sessions.length;
      metrics.activeCustomers = sessions.length;
    }

    // Get properties or services count based on business type
    if (businessType === 'real_estate') {
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null);

      metrics.pendingOrders = propertiesCount || 0;
    } else if (businessType === 'event_planning') {
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      metrics.pendingOrders = servicesCount || 0;
    }

    // Calculate conversion rate
    if (metrics.totalLeads > 0) {
      metrics.conversionRate = Math.round((metrics.totalSales / metrics.totalLeads) * 100);
    }

    // Get recent activity from orders
    const formattedActivity = orders?.slice(0, 5).map(o => ({
      title: `Order ${o.payment_status === 'completed' ? 'completed' : 'pending'}`,
      time: new Date(o.created_at).toLocaleString(),
    })) || [];

    return NextResponse.json({
      businessType,
      metrics,
      recentActivity: formattedActivity,
      user: {
        fullName: userData.full_name || 'User',
        businessName: userData.business_name || 'My Business',
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
