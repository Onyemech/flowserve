import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const metaAppId = process.env.META_APP_ID!
const metaAppSecret = process.env.META_APP_SECRET!

export async function POST(request: NextRequest) {
  console.log('=== OAuth Callback Started ===')
  
  try {
    const { code } = await request.json()
    console.log('Received code:', code ? 'Yes' : 'No')

    if (!code) {
      console.error('No authorization code provided')
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 })
    }

    // Verify environment variables
    if (!metaAppId || !metaAppSecret) {
      console.error('Meta credentials missing:', { metaAppId: !!metaAppId, metaAppSecret: !!metaAppSecret })
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      console.error('No access token in cookies')
      return NextResponse.json({ error: 'Unauthorized - Please log in again' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid session - Please log in again' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/whatsapp-connect`
    console.log('Redirect URI:', redirectUri)
    
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${metaAppId}&client_secret=${metaAppSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
    console.log('Exchanging code for token...')
    
    const tokenResponse = await fetch(tokenUrl, { method: 'GET' })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return NextResponse.json({ 
        error: 'Failed to exchange authorization code', 
        details: error 
      }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const userAccessToken = tokenData.access_token
    
    if (!userAccessToken) {
      console.error('No access token in response:', tokenData)
      return NextResponse.json({ error: 'No access token received from Facebook' }, { status: 400 })
    }
    
    console.log('✅ Access token received')

    // Get WhatsApp Business Account ID
    console.log('Fetching business accounts...')
    const wabsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?access_token=${userAccessToken}`,
      { method: 'GET' }
    )

    if (!wabsResponse.ok) {
      const error = await wabsResponse.text()
      console.error('Failed to fetch businesses:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch business accounts', 
        details: error 
      }, { status: 400 })
    }

    const wabsData = await wabsResponse.json()
    console.log('Businesses found:', wabsData.data?.length || 0)
    
    if (!wabsData.data || wabsData.data.length === 0) {
      console.error('No businesses found')
      return NextResponse.json({ 
        error: 'No WhatsApp Business accounts found. Please create a WhatsApp Business account first.' 
      }, { status: 404 })
    }

    const businessId = wabsData.data[0].id
    console.log('Using business ID:', businessId)

    // Get WhatsApp Business Account details
    console.log('Fetching WhatsApp Business Account...')
    const wabaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${businessId}/client_whatsapp_business_accounts?access_token=${userAccessToken}`,
      { method: 'GET' }
    )

    if (!wabaResponse.ok) {
      const error = await wabaResponse.text()
      console.error('Failed to fetch WABA:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch WhatsApp Business Account', 
        details: error 
      }, { status: 400 })
    }

    const wabaData = await wabaResponse.json()
    console.log('WABA found:', wabaData.data?.length || 0)

    if (!wabaData.data || wabaData.data.length === 0) {
      console.error('No WABA found')
      return NextResponse.json({ 
        error: 'No WhatsApp Business Account found. Please connect a WhatsApp Business account to your Facebook Business.' 
      }, { status: 404 })
    }

    const whatsappBusinessAccountId = wabaData.data[0].id
    console.log('Using WABA ID:', whatsappBusinessAccountId)

    // Get phone number
    console.log('Fetching phone numbers...')
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappBusinessAccountId}/phone_numbers?access_token=${userAccessToken}`,
      { method: 'GET' }
    )

    if (!phoneResponse.ok) {
      const error = await phoneResponse.text()
      console.error('Failed to fetch phone numbers:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch phone numbers', 
        details: error 
      }, { status: 400 })
    }

    const phoneData = await phoneResponse.json()
    console.log('Phone numbers found:', phoneData.data?.length || 0)

    if (!phoneData.data || phoneData.data.length === 0) {
      console.error('No phone numbers found')
      return NextResponse.json({ 
        error: 'No phone numbers found. Please add a phone number to your WhatsApp Business account.' 
      }, { status: 404 })
    }

    const phoneNumber = phoneData.data[0]
    const phoneNumberId = phoneNumber.id
    const displayPhoneNumber = phoneNumber.display_phone_number
    console.log('Using phone:', displayPhoneNumber)

    // Generate long-lived access token
    console.log('Generating long-lived token...')
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaAppId}&client_secret=${metaAppSecret}&fb_exchange_token=${userAccessToken}`,
      { method: 'GET' }
    )

    let finalAccessToken = userAccessToken

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json()
      finalAccessToken = longLivedData.access_token
      console.log('✅ Long-lived token generated')
    } else {
      console.warn('Failed to get long-lived token, using short-lived')
    }

    // Update user in database
    console.log('Saving to database...')
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
      console.error('❌ Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to save WhatsApp credentials' }, { status: 500 })
    }

    console.log('✅✅✅ WhatsApp connected successfully for user:', user.id)

    return NextResponse.json({
      success: true,
      phoneNumber: displayPhoneNumber,
    })
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
