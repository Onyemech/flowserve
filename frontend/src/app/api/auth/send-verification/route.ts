import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendVerificationEmail } from '@/lib/email/send'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('flowserve_users')
      .select('email, full_name, email_verified')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Save token to database
    const { error: updateError } = await supabase
      .from('flowserve_users')
      .update({
        verification_token: token,
        verification_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    // Send verification email
    await sendVerificationEmail(user.email, user.full_name || 'User', token)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    )
  }
}
