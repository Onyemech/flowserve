import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phone_number_id, access_token } = await request.json()

    if (!phone_number_id || !access_token) {
      return NextResponse.json(
        { error: 'Phone Number ID and Access Token are required' },
        { status: 400 }
      )
    }

    // Test the connection by fetching phone number details
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phone_number_id}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Invalid credentials' },
        { status: 400 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      phone_number: data.display_phone_number,
      verified_name: data.verified_name,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Connection test failed' },
      { status: 500 }
    )
  }
}
