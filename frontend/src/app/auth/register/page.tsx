'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Sign up WITHOUT Supabase email confirmation
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { 
            full_name: formData.fullName,
          },
        },
      })
      
      if (error) throw error
      
      if (data.user) {
        // Update flowserve_users with full name
        await supabase
          .from('flowserve_users')
          .update({ full_name: formData.fullName })
          .eq('id', data.user.id)
        
        // Try to send verification email (optional - won't block registration)
        try {
          await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.user.id }),
          })
        } catch (emailError) {
          console.log('Email sending skipped:', emailError)
        }
      }
      
      showToast('success', 'Registration successful! Redirecting to setup...')
      // Force full page reload to ensure session is properly set
      window.location.href = '/dashboard/setup'
    } catch (error: any) {
      showToast('error', error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        },
      })
      if (error) throw error
      // OAuth will redirect automatically, no need to handle here
    } catch (error: any) {
      showToast('error', error.message || 'Google sign-in failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#E8EBF0] dark:bg-[#102216] font-['Inter'] text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-md p-4 sm:p-6 mt-4">
        <div className="flex justify-center pt-8 pb-8">
          <Link href="/">
            <Image src="/icon-512x512.png" alt="FlowServe AI" width={120} height={120} className="w-auto h-24" priority />
          </Link>
        </div>
        <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">Create Your Admin Account</h1>
        <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-normal pb-8 text-center">Manage your WhatsApp business automation in one place.</p>
        <form onSubmit={handleEmailRegister} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-white text-base font-medium">Full Name</label>
            <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Enter your full name" disabled={isLoading} className="flex w-full rounded-lg bg-gray-50 dark:bg-[#193322] border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] outline-none" />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-white text-base font-medium">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@company.com" disabled={isLoading} className="flex w-full rounded-lg bg-gray-50 dark:bg-[#193322] border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] outline-none" />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-white text-base font-medium">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                placeholder="Enter your password" 
                disabled={isLoading} 
                className="flex w-full rounded-lg bg-gray-50 dark:bg-[#193322] border border-gray-300 dark:border-gray-600 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] outline-none" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center rounded-lg h-12 bg-[#4A90E2] text-white text-base font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Already have an account? <Link href="/auth/login" className="font-bold text-[#4A90E2] hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
