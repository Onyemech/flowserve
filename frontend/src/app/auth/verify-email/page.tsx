'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      verifyEmail(token)
    }
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    setIsVerifying(true)
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setStatus('success')
      setMessage('Email verified successfully! Redirecting to dashboard...')
      showToast('success', 'Email verified successfully!')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Verification failed. The link may have expired.')
      showToast('error', error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Please log in to resend verification email')
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email')
      }

      showToast('success', 'Verification email sent! Please check your inbox.')
      setMessage('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8EBF0] dark:bg-[#102216] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Verification</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          {isVerifying ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent a verification link to your email address. Please click the link to verify your account.
              </p>
              
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
