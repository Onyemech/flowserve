import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Get user metadata from OAuth provider
      const fullName = data.user.user_metadata?.full_name || 
                       data.user.user_metadata?.name || 
                       data.user.email?.split('@')[0] || ''
      
      // Update flowserve_users with full name from OAuth
      if (fullName) {
        await supabase
          .from('flowserve_users')
          .update({ full_name: fullName })
          .eq('id', data.user.id)
      }
      
      // Check if user needs to complete setup
      const { data: profile } = await supabase
        .from('flowserve_users')
        .select('business_name, business_type')
        .eq('id', data.user.id)
        .single()
      
      // Redirect based on setup status
      if (!profile?.business_name || !profile?.business_type) {
        return NextResponse.redirect(new URL('/dashboard/setup', requestUrl.origin))
      }
      
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
