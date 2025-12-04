import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('Dashboard API - No session:', sessionError)
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 })
    }
    
    // Then get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Dashboard API - No user:', authError)
      return NextResponse.json({ error: 'Unauthorized - No user' }, { status: 401 })
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
        .select('id, amount, status, payment_status, created_at')
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
