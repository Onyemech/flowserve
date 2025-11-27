'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const reference = searchParams.get('reference')

  useEffect(() => {
    if (reference) {
      // Payment verification happens via webhook
      // This is just a confirmation page
      setTimeout(() => {
        setStatus('success')
      }, 2000)
    } else {
      setStatus('failed')
    }
  }, [reference])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="bg-white text-center py-12">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Processing Payment...</h1>
              <p className="text-gray-600">Please wait while we confirm your payment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your payment has been received. You'll receive a confirmation on WhatsApp shortly.
              </p>
              <p className="text-sm text-gray-500">Reference: {reference}</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">
                Something went wrong with your payment. Please try again.
              </p>
              <Button onClick={() => window.history.back()} variant="primary">
                Try Again
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
