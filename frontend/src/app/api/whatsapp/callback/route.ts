import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId
    const error = searchParams.get('error')

    if (error) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'whatsapp_error', error: '${error}' }, '*')
              window.close()
            </script>
            <p>Authorization failed. You can close this window.</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/callback`
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(errorData.error?.message || 'Failed to exchange code for token')
    }

    const { access_token } = await tokenResponse.json()

    // Get WhatsApp Business Accounts
    const wabaResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?access_token=${access_token}`
    )

    if (!wabaResponse.ok) {
      throw new Error('Failed to fetch WhatsApp Business Accounts')
    }

    const { data: businesses } = await wabaResponse.json()
    
    if (!businesses || businesses.length === 0) {
      throw new Error('No WhatsApp Business Account found')
    }

    const wabaId = businesses[0].id

    // Get phone numbers
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?access_token=${access_token}`
    )

    if (!phoneResponse.ok) {
      throw new Error('Failed to fetch phone numbers')
    }

    const { data: phones } = await phoneResponse.json()

    if (!phones || phones.length === 0) {
      throw new Error('No phone number found in WhatsApp Business Account')
    }

    const phone = phones[0]

    // Save to database
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('flowserve_users')
      .update({
        whatsapp_phone_number_id: phone.id,
        whatsapp_access_token: access_token,
        whatsapp_business_account_id: wabaId,
        whatsapp_display_phone_number: phone.display_phone_number,
        whatsapp_connected: true,
        whatsapp_connected_at: new Date().toISOString()
      })
      .eq('id', state)

    if (dbError) {
      throw new Error('Failed to save WhatsApp connection')
    }

    // Subscribe to webhooks (if system user token is configured)
    if (process.env.META_SYSTEM_USER_TOKEN) {
      try {
        await fetch(
          `https://graph.facebook.com/v18.0/${phone.id}/subscribed_apps`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`
            }
          }
        )
      } catch (webhookError) {
        console.error('Failed to subscribe to webhooks:', webhookError)
        // Don't fail the whole flow if webhook subscription fails
      }
    }

    // Close popup and notify parent window
    return new Response(`
      <html>
        <head>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .checkmark {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: white;
              margin: 0 auto 1rem;
              display: flex;
              align-items: center;
              justify-center;
              animation: scaleIn 0.3s ease-out;
            }
            @keyframes scaleIn {
              from { transform: scale(0); }
              to { transform: scale(1); }
            }
            .checkmark svg {
              width: 50px;
              height: 50px;
              stroke: #10b981;
              stroke-width: 3;
              fill: none;
              stroke-linecap: round;
              stroke-linejoin: round;
              animation: draw 0.5s ease-out 0.3s forwards;
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
            }
            @keyframes draw {
              to { stroke-dashoffset: 0; }
            }
            h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
            p { margin: 0; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">
              <svg viewBox="0 0 52 52">
                <path d="M14 27l8 8 16-16"/>
              </svg>
            </div>
            <h1>WhatsApp Connected!</h1>
            <p>You can close this window now.</p>
          </div>
          <script>
            window.opener.postMessage({ type: 'whatsapp_connected' }, '*')
            setTimeout(() => window.close(), 2000)
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error: any) {
    console.error('WhatsApp callback error:', error)
    
    return new Response(`
      <html>
        <head>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-center;
              height: 100vh;
              margin: 0;
              background: #fee;
              color: #c00;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Connection Failed</h1>
            <p>${error.message}</p>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: #666;">
              You can close this window and try again.
            </p>
          </div>
          <script>
            window.opener.postMessage({ type: 'whatsapp_error', error: '${error.message}' }, '*')
          </script>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}
