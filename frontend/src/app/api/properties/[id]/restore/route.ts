import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Restore soft-deleted property
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: property, error } = await supabase
      .from('properties')
      .update({ 
        deleted_at: null,
        status: 'available'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ property })
  } catch (error: any) {
    console.error('Restore property error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to restore property' },
      { status: 500 }
    )
  }
}
