import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('flowserve_users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id);

    const totalRevenue = orders
      ?.filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0) || 0;

    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter(o => o.payment_status === 'pending').length || 0;

    // Get unique customers
    const uniqueCustomers = new Set(orders?.map(o => o.customer_phone)).size;

    // Get active listings
    const tableName = profile?.business_type === 'real_estate' ? 'properties' : 'services';
    const { count: activeListings } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null);

    return NextResponse.json({
      businessType: profile?.business_type,
      metrics: {
        totalSales: totalOrders,
        totalLeads: uniqueCustomers,
        conversionRate: totalOrders > 0 ? (totalOrders / uniqueCustomers) * 100 : 0,
        revenue: totalRevenue,
        activeCustomers: uniqueCustomers,
        pendingOrders,
      },
      recentActivity: [],
      user: {
        fullName: profile?.full_name || 'User',
        businessName: profile?.business_name || 'My Business',
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
