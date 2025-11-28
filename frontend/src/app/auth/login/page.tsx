'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) throw error
      if (!data.session) throw new Error('No session created')
      
      showToast('success', 'Login successful!')
      // Force full page reload to ensure session is properly set
      window.location.href = '/dashboard'
    } catch (error: any) {
      showToast('error', error.message || 'Login failed')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
    <div className="min-h-screen w-full flex flex-col bg-[#E8EBF0] dark:bg-[#102216] font-['Inter'] text-gray-900 dark:text-white">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex justify-center pb-6 pt-8">
            <Link href="/">
              <Image src="/logo.svg" alt="FlowServe AI" width={240} height={80} className="w-auto h-20" priority />
            </Link>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-center pb-8">Welcome Back, Admin!</h1>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 dark:text-white text-base font-medium">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com" 
                disabled={isLoading}
                className="flex w-full rounded-lg bg-gray-50 dark:bg-[#193322] border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] outline-none"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 dark:text-white text-base font-medium">Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password" 
                disabled={isLoading}
                className="flex w-full rounded-lg bg-gray-50 dark:bg-[#193322] border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] outline-none"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="w-full text-right pt-2">
              <Link href="/auth/forgot-password" className="text-[#4A90E2] hover:text-[#4A90E2]/80 text-sm font-medium underline">Forgot Password?</Link>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4A90E2] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#4A90E2]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2] transition-all disabled:opacity-50">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <Link href="/auth/register" className="font-bold text-[#4A90E2] hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
