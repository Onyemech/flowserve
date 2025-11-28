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

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user profile
    const { data: profile } = await supabase
      .from('flowserve_users')
      .select('business_type')
      .eq('id', user.id)
      .single();

    // Get all orders in date range
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Calculate metrics
    const totalRevenue = orders
      ?.filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0) || 0;

    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.payment_status === 'completed').length || 0;
    const pendingOrders = orders?.filter(o => o.payment_status === 'pending').length || 0;
    const failedOrders = orders?.filter(o => o.payment_status === 'failed').length || 0;

    // Unique customers
    const uniqueCustomers = new Set(orders?.map(o => o.customer_phone)).size;

    // Conversion rate
    const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Revenue by month
    const revenueByMonth = getRevenueByMonth(orders || [], days);

    // Orders by status
    const ordersByStatus = [
      { status: 'pending', count: pendingOrders },
      { status: 'completed', count: completedOrders },
      { status: 'failed', count: failedOrders },
    ];

    // Top items
    const itemCounts: { [key: string]: { count: number; revenue: number } } = {};
    orders?.forEach(order => {
      const itemName = order.item_name || 'Unknown Item';
      if (!itemCounts[itemName]) {
        itemCounts[itemName] = { count: 0, revenue: 0 };
      }
      itemCounts[itemName].count++;
      if (order.payment_status === 'completed') {
        itemCounts[itemName].revenue += parseFloat(order.amount || '0');
      }
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders
    const recentOrders = orders?.slice(0, 10) || [];

    // Active listings
    const tableName = profile?.business_type === 'real_estate' ? 'properties' : 'services';
    const { count: activeListings } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers: uniqueCustomers,
      conversionRate,
      pendingOrders,
      completedOrders,
      activeListings: activeListings || 0,
      revenueByMonth,
      ordersByStatus,
      topItems,
      recentOrders,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getRevenueByMonth(orders: any[], days: number) {
  const months: { [key: string]: number } = {};
  const now = new Date();
  
  // Initialize months
  const monthCount = Math.min(Math.ceil(days / 30), 12);
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString('en-US', { month: 'short' });
    months[key] = 0;
  }

  // Aggregate revenue by month
  orders.forEach(order => {
    if (order.payment_status === 'completed') {
      const date = new Date(order.created_at);
      const key = date.toLocaleDateString('en-US', { month: 'short' });
      if (months[key] !== undefined) {
        months[key] += parseFloat(order.amount || '0');
      }
    }
  });

  return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
}
