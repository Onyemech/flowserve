'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Email is required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send reset email')
      showToast('success', 'Password reset email sent! Please check your inbox.')
    } catch (error: any) {
      showToast('error', error.message)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="font-['Inter'] bg-[#f6f8f6] dark:bg-[#102216] min-h-screen flex flex-col">
      <div className="relative flex h-auto min-h-screen w-full flex-col">
        <div className="flex items-center p-4 pb-2 bg-[#f6f8f6] dark:bg-[#102216]">
          <button onClick={() => router.back()} className="text-slate-800 dark:text-white flex size-12 shrink-0 items-center justify-center -ml-3 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-slate-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center -ml-12">Forgot Password</h2>
        </div>
        <div className="flex-grow flex flex-col justify-between p-4">
          <div className="pt-2">
            <p className="text-slate-600 dark:text-gray-300 text-base font-normal leading-normal pb-8">
              Enter your registered email to receive a password reset link.
            </p>
            <div className="flex flex-col gap-2 py-3">
              <label className="text-slate-800 dark:text-white text-base font-medium leading-normal pb-2">Email Address</label>
              <div className="relative">
                <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#4A90E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input 
                  autoFocus 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  disabled={isLoading}
                  className="flex w-full resize-none overflow-hidden rounded-lg text-slate-800 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#4A90E2]/50 border border-slate-300 dark:border-[#326744] bg-gray-50 dark:bg-[#193322] focus:border-[#4A90E2] h-14 placeholder:text-slate-400 dark:placeholder:text-[#92c9a4] pl-12 pr-4 py-[15px] text-base font-normal leading-normal"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <div className="flex py-3 w-full">
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#4A90E2] text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50"
            >
              <span className="truncate">{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
