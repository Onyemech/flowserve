import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendVerificationEmail } from '@/lib/email/send'
import crypto from 'crypto'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user details from flowserve_users
    const { data: userData, error: userError } = await supabase
      .from('flowserve_users')
      .select('email, full_name, email_verified')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userData.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Update token in database
    const { error: updateError } = await supabase
      .from('flowserve_users')
      .update({
        verification_token: token,
        verification_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Send verification email
    await sendVerificationEmail(userData.email, userData.full_name || 'User', token)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
