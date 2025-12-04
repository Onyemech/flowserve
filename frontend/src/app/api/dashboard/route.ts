import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('flowserve_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const businessType = userData.business_type

    // Get real metrics from database
    const [ordersResult, customersResult, leadsResult] = await Promise.all([
      // Get orders
      supabase
        .from('orders')
        .select('amount, status, payment_status, created_at')
        .eq('user_id', user.id),
      
      // Get customers
      supabase
        .from('customers')
        .select('id, created_at')
        .eq('user_id', user.id),
      
      // Get leads based on business type
      businessType === 'real_estate'
        ? supabase
            .from('real_estate_leads')
            .select('id, status, created_at')
            .eq('user_id', user.id)
        : supabase
            .from('event_planning_leads')
            .select('id, status, created_at')
            .eq('user_id', user.id)
    ])

    const orders = ordersResult.data || []
    const customers = customersResult.data || []
    const leads = leadsResult.data || []

    // Calculate metrics
    const totalRevenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + Number(o.amount), 0)

    const totalSales = orders.filter(o => o.payment_status === 'paid').length

    const pendingOrders = orders.filter(o => 
      o.status === 'pending' || o.payment_status === 'unpaid'
    ).length

    const totalLeads = leads.length

    const closedLeads = leads.filter(l => 
      l.status === 'closed' || l.status === 'booked' || l.status === 'completed'
    ).length

    const conversionRate = totalLeads > 0 
      ? Math.round((closedLeads / totalLeads) * 100) 
      : 0

    // Get recent activity (last 10 orders)
    const recentActivity = orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        type: 'order',
        status: order.status,
        amount: order.amount,
        createdAt: order.created_at,
      }))

    return NextResponse.json({
      businessType,
      metrics: {
        totalSales,
        totalLeads,
        conversionRate,
        revenue: totalRevenue,
        activeCustomers: customers.length,
        pendingOrders,
      },
      recentActivity,
      user: {
        fullName: userData.full_name || 'User',
        businessName: userData.business_name || 'My Business',
        whatsappConnected: userData.whatsapp_connected || false,
      },
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
