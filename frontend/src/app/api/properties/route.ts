import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ properties: properties || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, price, description, location, images } = body

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
        title,
        price,
        description,
        location,
        images: images || [],
        status: 'available'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ property })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
