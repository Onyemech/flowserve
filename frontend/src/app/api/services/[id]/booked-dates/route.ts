import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET booked dates for a specific service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: service, error } = await supabase
      .from('services')
      .select('id, name, booked_dates')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ 
      serviceId: service.id,
      serviceName: service.name,
      bookedDates: service.booked_dates || []
    })
  } catch (error) {
    console.error('Error fetching booked dates:', error)
    return NextResponse.json({ error: 'Failed to fetch booked dates' }, { status: 500 })
  }
}

// POST - Add booked dates to a service
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dates } = body // Array of date strings in YYYY-MM-DD format

    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'Invalid dates array' }, { status: 400 })
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const invalidDates = dates.filter(date => !dateRegex.test(date))
    if (invalidDates.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD',
        invalidDates 
      }, { status: 400 })
    }

    // Get current booked dates
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('booked_dates')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) throw fetchError

    const currentDates = (service.booked_dates as string[]) || []
    const newDates = [...new Set([...currentDates, ...dates])].sort()

    // Update service with new booked dates
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({ booked_dates: newDates })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true,
      bookedDates: updatedService.booked_dates,
      addedDates: dates
    })
  } catch (error) {
    console.error('Error adding booked dates:', error)
    return NextResponse.json({ error: 'Failed to add booked dates' }, { status: 500 })
  }
}

// DELETE - Remove booked dates from a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dates } = body // Array of date strings to remove

    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'Invalid dates array' }, { status: 400 })
    }

    // Get current booked dates
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('booked_dates')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) throw fetchError

    const currentDates = (service.booked_dates as string[]) || []
    const updatedDates = currentDates.filter(date => !dates.includes(date))

    // Update service with filtered dates
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({ booked_dates: updatedDates })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true,
      bookedDates: updatedService.booked_dates,
      removedDates: dates
    })
  } catch (error) {
    console.error('Error removing booked dates:', error)
    return NextResponse.json({ error: 'Failed to remove booked dates' }, { status: 500 })
  }
}
