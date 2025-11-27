import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPasswordResetEmail } from '@/lib/email/send'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('flowserve_users')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    // Don't reveal if user exists or not for security
    if (userError || !user) {
      return NextResponse.json({ success: true })
    }

    // Generate password reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Save token to database
    const { error: updateError } = await supabase
      .from('flowserve_users')
      .update({
        password_reset_token: token,
        password_reset_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.full_name || 'User', token)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send password reset email' },
      { status: 500 }
    )
  }
}
