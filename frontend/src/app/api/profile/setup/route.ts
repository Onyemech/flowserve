import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { business_name, business_type, bank_name, account_number, account_name, bank_code } = await request.json()

    if (!business_name || !business_type) {
      return NextResponse.json({ error: 'Business name and type are required' }, { status: 400 })
    }

    if (!['real_estate', 'event_planning'].includes(business_type)) {
      return NextResponse.json({ error: 'Invalid business type' }, { status: 400 })
    }

    if (!bank_name || !account_number || !account_name || !bank_code) {
      return NextResponse.json({ error: 'Payment details are required' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('flowserve_users')
      .update({
        business_name,
        business_type,
        bank_name,
        account_number,
        account_name,
        bank_code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    const { error: usageError } = await supabase
      .from('cloudinary_usage')
      .insert({
        user_id: user.id,
        total_storage_mb: 0,
        total_assets: 0,
      })
      .select()
      .single()

    if (usageError && !usageError.message.includes('duplicate')) {
      console.error('Cloudinary usage init error:', usageError)
    }

    return NextResponse.json({
      success: true,
      message: 'Profile setup complete',
    })
  } catch (error: any) {
    console.error('Profile setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    )
  }
}
