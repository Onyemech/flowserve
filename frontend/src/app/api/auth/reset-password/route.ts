import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find user with this token
    const { data: user, error: userError } = await supabase
      .from('flowserve_users')
      .select('id, password_reset_token_expires_at')
      .eq('password_reset_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(user.password_reset_token_expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateError) {
      throw updateError
    }

    // Clear reset token
    await supabase
      .from('flowserve_users')
      .update({
        password_reset_token: null,
        password_reset_token_expires_at: null,
      })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Password reset failed' },
      { status: 500 }
    )
  }
}
