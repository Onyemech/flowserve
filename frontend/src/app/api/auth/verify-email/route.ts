import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find user with this token
    const { data: user, error: userError } = await supabase
      .from('flowserve_users')
      .select('id, email, full_name, email_verified, verification_token_expires_at')
      .eq('verification_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(user.verification_token_expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('flowserve_users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.full_name || 'User')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Email verification failed' },
      { status: 500 }
    )
  }
}
