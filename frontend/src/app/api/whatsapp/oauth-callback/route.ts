import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const metaAppId = process.env.META_APP_ID!
const metaAppSecret = process.env.META_APP_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 })
    }

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

    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/whatsapp-connect`
    
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${metaAppId}&client_secret=${metaAppSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
      { method: 'GET' }
    )

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const userAccessToken = tokenData.access_token

    // Get WhatsApp Business Account ID
    const wabsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?access_token=${userAccessToken}`,
      { method: 'GET' }
    )

    if (!wabsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch business accounts' }, { status: 400 })
    }

    const wabsData = await wabsResponse.json()
    
    if (!wabsData.data || wabsData.data.length === 0) {
      return NextResponse.json({ error: 'No WhatsApp Business accounts found' }, { status: 404 })
    }

    const businessId = wabsData.data[0].id

    // Get WhatsApp Business Account details
    const wabaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${businessId}/client_whatsapp_business_accounts?access_token=${userAccessToken}`,
      { method: 'GET' }
    )

    if (!wabaResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch WhatsApp Business Account' }, { status: 400 })
    }

    const wabaData = await wabaResponse.json()

    if (!wabaData.data || wabaData.data.length === 0) {
      return NextResponse.json({ error: 'No WhatsApp Business Account found' }, { status: 404 })
    }

    const whatsappBusinessAccountId = wabaData.data[0].id

    // Get phone number
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappBusinessAccountId}/phone_numbers?access_token=${userAccessToken}`,
      { method: 'GET' }
    )

    if (!phoneResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch phone numbers' }, { status: 400 })
    }

    const phoneData = await phoneResponse.json()

    if (!phoneData.data || phoneData.data.length === 0) {
      return NextResponse.json({ error: 'No phone numbers found' }, { status: 404 })
    }

    const phoneNumber = phoneData.data[0]
    const phoneNumberId = phoneNumber.id
    const displayPhoneNumber = phoneNumber.display_phone_number

    // Generate long-lived access token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaAppId}&client_secret=${metaAppSecret}&fb_exchange_token=${userAccessToken}`,
      { method: 'GET' }
    )

    let finalAccessToken = userAccessToken

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json()
      finalAccessToken = longLivedData.access_token
    }

    // Update user in database
    const { error: updateError } = await supabase
      .from('flowserve_users')
      .update({
        whatsapp_phone_number_id: phoneNumberId,
        whatsapp_access_token: finalAccessToken,
        whatsapp_business_account_id: whatsappBusinessAccountId,
        whatsapp_display_phone_number: displayPhoneNumber,
        whatsapp_connected: true,
        whatsapp_connected_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to save WhatsApp credentials' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      phoneNumber: displayPhoneNumber,
    })
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
