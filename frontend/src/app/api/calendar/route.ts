import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    const serviceId = searchParams.get('serviceId')

    // Get start and end dates for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

    // Fetch orders with event dates in this month
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        event_date,
        event_time,
        guest_count,
        event_location,
        amount,
        status,
        payment_status,
        service_id,
        customer:customers(name, phone_number),
        service:services(name)
      `)
      .eq('user_id', user.id)
      .eq('item_type', 'service')
      .gte('event_date', startDate)
      .lte('event_date', endDate)

    if (serviceId) {
      ordersQuery = ordersQuery.eq('service_id', serviceId)
    }

    const { data: orders, error: ordersError } = await ordersQuery.order('event_date', { ascending: true })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    // Fetch services with booked dates
    let servicesQuery = supabase
      .from('services')
      .select('id, name, booked_dates')
      .eq('user_id', user.id)

    if (serviceId) {
      servicesQuery = servicesQuery.eq('id', serviceId)
    }

    const { data: services, error: servicesError } = await servicesQuery

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    // Combine booked dates from all services
    const bookedDates: { [key: string]: { serviceId: string; serviceName: string }[] } = {}
    
    services?.forEach(service => {
      const dates = service.booked_dates as string[] || []
      dates.forEach(date => {
        // Filter dates within the requested month
        if (date >= startDate && date <= endDate) {
          if (!bookedDates[date]) {
            bookedDates[date] = []
          }
          bookedDates[date].push({
            serviceId: service.id,
            serviceName: service.name
          })
        }
      })
    })

    return NextResponse.json({ 
      events: orders || [],
      bookedDates,
      services: services || []
    })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
