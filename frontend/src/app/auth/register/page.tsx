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
            <Image src="/logo.svg" alt="FlowServe AI" width={240} height={80} className="w-auto h-20" priority />
          </Link>
        </div>
        <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">Create Your Admin Account</h1>
        <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-normal pb-8 text-center">Manage your WhatsApp business automation in one place.</p>
        <div className="flex pb-4">
          <button onClick={handleGoogleRegister} disabled={isLoading} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white gap-3 text-base font-bold border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.75 15.93 16.92 17.21 15.65 18.06V20.84H19.46C21.45 19.01 22.56 15.93 22.56 12.25Z" fill="#4285F4"></path>
              <path d="M12 23C14.97 23 17.45 22.04 19.46 20.84L15.65 18.06C14.66 18.72 13.43 19.12 12 19.12C9.11 19.12 6.64 17.28 5.75 14.8L1.8 17.65C3.54 20.95 7.42 23 12 23Z" fill="#34A853"></path>
              <path d="M5.75 14.8C5.54 14.23 5.43 13.62 5.43 13C5.43 12.38 5.54 11.77 5.75 11.2L1.8 8.35C0.96 10.02 0.44 11.45 0.44 13C0.44 14.55 0.96 15.98 1.8 17.65L5.75 14.8Z" fill="#FBBC05"></path>
              <path d="M12 6.88C13.56 6.88 14.88 7.44 15.89 8.39L19.54 4.89C17.45 3.02 14.97 2 12 2C7.42 2 3.54 4.05 1.8 7.35L5.75 10.2C6.64 7.72 9.11 6.88 12 6.88Z" fill="#EA4335"></path>
            </svg>
            Sign up with Google
          </button>
        </div>
        <div className="flex items-center gap-4 py-2">
          <hr className="flex-1 border-gray-200 dark:border-gray-700" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">or</p>
          <hr className="flex-1 border-gray-200 dark:border-gray-700" />
        </div>
        <form onSubmit={handleEmailRegister} className="space-y-4 pt-4">
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
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter your password" disabled={isLoading} className="flex w-full rounded-lg bg-gray-50 dark:bg-[#193322] border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] outline-none" />
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
