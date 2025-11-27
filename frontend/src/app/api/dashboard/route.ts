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

    // Get leads based on business type
    if (businessType === 'real_estate') {
      const { data: leads } = await supabase
        .from('real_estate_leads')
        .select('*')
        .eq('user_id', user.id);

      if (leads) {
        metrics.totalLeads = leads.filter(l => l.status === 'new').length;
        metrics.activeCustomers = leads.length;
        const closedLeads = leads.filter(l => l.status === 'closed').length;
        metrics.conversionRate = leads.length > 0 
          ? Math.round((closedLeads / leads.length) * 100) 
          : 0;
      }

      // Get properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null);

      metrics.pendingOrders = propertiesCount || 0;
    } else if (businessType === 'event_planning') {
      const { data: leads } = await supabase
        .from('event_planning_leads')
        .select('*')
        .eq('user_id', user.id);

      if (leads) {
        metrics.totalLeads = leads.filter(l => l.status === 'inquiry').length;
        metrics.activeCustomers = leads.length;
        const bookedLeads = leads.filter(l => l.status === 'booked').length;
        metrics.conversionRate = leads.length > 0 
          ? Math.round((bookedLeads / leads.length) * 100) 
          : 0;
      }

      // Get services count
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      metrics.pendingOrders = servicesCount || 0;
    }

    // Get recent notifications as activity
    const { data: recentActivity } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const formattedActivity = recentActivity?.map(n => ({
      title: n.title,
      time: new Date(n.created_at).toLocaleString(),
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
