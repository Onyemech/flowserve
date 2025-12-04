'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function LandingPage() {
  const router = useRouter()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if user is logged in
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        router.push('/dashboard')
      }
    }

    checkAuth()

    // Check if already installed (PWA mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true
    
    if (isStandalone) {
      setIsInstalled(true)
      setIsInstallable(false)
    } else {
      // Always show install button if not in standalone mode
      setIsInstallable(true)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      console.log('Install prompt available')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [router])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no prompt available, show instructions with confirm dialog
      const userConfirmed = confirm(
        'To install:\n\n' +
        '• Chrome/Edge: Look for install icon in address bar\n' +
        '• Safari: Tap Share → Add to Home Screen\n' +
        '• Firefox: Tap Menu → Install\n\n' +
        'Click OK to continue'
      )
      
      if (userConfirmed) {
        // Try to trigger install if browser supports it
        // For browsers that don't support beforeinstallprompt
        console.log('User confirmed install instructions')
      }
      return
    }

    // For browsers that support beforeinstallprompt (Chrome, Edge)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstallable(false)
        setDeferredPrompt(null)
      } else {
        console.log('User dismissed the install prompt')
      }
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#103358] to-[#0A2540] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20C997]"></div>
      </div>
    )
  }

  // PWA is installed but user not logged in - Show auth options
  if (isInstalled) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#0A2540] via-[#103358] to-[#0A2540] text-white font-['Inter'] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/logo.svg" alt="FlowServe AI" width={120} height={120} className="animate-pulse" />
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#50E3C2] to-[#4A90E2] bg-clip-text text-transparent">
              Welcome to FlowServe AI
            </h1>
            <p className="text-lg text-white/70">
              Automate your business with AI-powered WhatsApp assistant
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-4">
            <Link 
              href="/auth/register" 
              className="block w-full py-4 px-6 bg-gradient-to-r from-[#4A90E2] to-[#20C997] text-white text-lg font-bold rounded-full shadow-xl shadow-[#4A90E2]/50 hover:scale-105 transition-transform"
            >
              Create Account
            </Link>
            
            <Link 
              href="/auth/login" 
              className="block w-full py-4 px-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-lg font-bold rounded-full hover:bg-white/20 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="pt-8 space-y-3 text-sm text-white/60">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-[#20C997]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>AI-Powered WhatsApp Automation</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-[#20C997]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant Payment Processing</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-[#20C997]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real Estate & Event Planning</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Public landing page - Show install button
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A2540] via-[#103358] to-[#0A2540] text-white font-['Inter']">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#0A2540]/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="FlowServe AI" width={48} height={48} />
          <h2 className="text-xl font-bold">FlowServe AI</h2>
        </div>
        
        {/* Install Button in Header */}
        {isInstallable && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4A90E2] to-[#20C997] text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-[#4A90E2]/50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Install App
          </button>
        )}
        
        {isInstalled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#20C997]/20 border border-[#20C997]/50 text-[#20C997] text-sm font-bold rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Installed
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24">
          <div className="flex min-h-[500px] flex-col gap-8 items-center justify-center text-center">
            {/* Large Logo */}
            <div className="relative">
              <Image src="/logo.svg" alt="FlowServe AI" width={160} height={160} className="animate-pulse" />
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-black leading-tight tracking-tighter sm:text-6xl bg-gradient-to-r from-white via-[#50E3C2] to-[#4A90E2] bg-clip-text text-transparent">
                Automate Your Business on WhatsApp with AI
              </h1>
              <h2 className="text-lg font-normal leading-normal text-white/70 max-w-2xl mx-auto sm:text-xl">
                Real Estate & Event Planning businesses trust FlowServe AI to handle customer conversations, payments, and operations 24/7.
              </h2>
            </div>

            {/* Install Button */}
            {isInstallable && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-3 rounded-full h-16 px-8 bg-gradient-to-r from-[#4A90E2] to-[#20C997] text-white text-lg font-bold shadow-2xl shadow-[#4A90E2]/50 hover:scale-105 transition-transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install FlowServe AI
              </button>
            )}

            {isInstalled && (
              <div className="flex items-center justify-center gap-3 rounded-full h-16 px-8 bg-[#20C997]/20 border-2 border-[#20C997]/50 text-[#20C997] text-lg font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                App Installed Successfully
              </div>
            )}

            {/* PWA Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#20C997] animate-pulse"></div>
              <span className="text-sm text-white/60">• Works Offline</span>
            </div>
          </div>
        </section>

        {/* Visual Element/Mockup */}
        <section className="px-4 max-w-6xl mx-auto -mt-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4A90E2]/20 to-[#20C997]/20 blur-3xl"></div>
            <div className="relative w-full bg-gradient-to-br from-[#1B252E] to-[#0A2540] rounded-2xl border border-white/10 shadow-2xl p-8 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* WhatsApp Chat Preview */}
                <div className="bg-[#0A2540] rounded-xl p-4 border border-white/10">
                  <div className="bg-[#075E54] text-white px-4 py-3 rounded-t-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold">FlowServe AI</div>
                      <div className="text-xs text-white/70">Online</div>
                    </div>
                  </div>
                  <div className="bg-[#0D1418] p-4 space-y-3 rounded-b-xl min-h-[300px]">
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-lg rounded-tl-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm text-white">Show me available properties</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#005C4B] rounded-lg rounded-tr-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm text-white">Here are 3 available properties:</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#005C4B] rounded-lg px-3 py-2 max-w-[80%]">
                        <div className="w-48 h-32 bg-white/10 rounded-lg mb-2"></div>
                        <p className="text-xs text-white font-semibold">3 Bedroom Flat - Lekki</p>
                        <p className="text-xs text-[#20C997]">₦5,000,000</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">AI-Powered Conversations</h4>
                      <p className="text-sm text-white/60">Understands customer intent and responds naturally in real-time</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Instant Payments</h4>
                      <p className="text-sm text-white/60">Paystack integration with automatic transfers to your account</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Media Management</h4>
                      <p className="text-sm text-white/60">Cloudinary integration for images with automatic cleanup</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="flex flex-col gap-12 px-4 py-16 sm:py-24 max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 text-center">
            <h3 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Everything You Need, All in One Place
            </h3>
            <p className="text-lg font-normal leading-normal text-white/60 max-w-2xl mx-auto">
              Built specifically for Real Estate and Event Planning businesses in Nigeria
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-[#4A90E2]/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-white">Real Estate Listings</h4>
                <p className="text-sm font-normal text-white/60">Add properties with images, auto-mark as sold, 14-day cleanup</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-[#4A90E2]/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-white">WhatsApp Automation</h4>
                <p className="text-sm font-normal text-white/60">AI handles inquiries, shows listings, processes orders 24/7</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-[#4A90E2]/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-white">Event Services</h4>
                <p className="text-sm font-normal text-white/60">Showcase packages, handle bookings, send invoices instantly</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-[#4A90E2]/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-white">Auto Transfers</h4>
                <p className="text-sm font-normal text-white/60">Paystack payments instantly transferred to your bank account</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="flex flex-col gap-12 px-4 py-16 sm:py-24 bg-white/5 backdrop-blur-sm border-y border-white/10">
          <div className="flex flex-col gap-3 text-center">
            <h3 className="text-4xl font-bold leading-tight tracking-tight text-white">How It Works</h3>
            <p className="text-lg font-normal leading-normal text-white/60 max-w-2xl mx-auto">
              Get your AI assistant running in minutes, not hours
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A90E2] to-[#20C997] text-white font-bold text-2xl shadow-lg">1</div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold text-white">Sign Up & Setup</h4>
                <p className="text-sm text-white/60">Create account, choose business type, add bank details for auto-transfers</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A90E2] to-[#20C997] text-white font-bold text-2xl shadow-lg">2</div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold text-white">Add Your Listings</h4>
                <p className="text-sm text-white/60">Upload properties or services with images directly from your phone</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A90E2] to-[#20C997] text-white font-bold text-2xl shadow-lg">3</div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold text-white">AI Takes Over</h4>
                <p className="text-sm text-white/60">Customers chat on WhatsApp, AI handles everything, money hits your account</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-white/60">AI Availability</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">&lt;1s</div>
              <div className="text-sm text-white/60">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-white/60">Automated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">₦0</div>
              <div className="text-sm text-white/60">Setup Fee</div>
            </div>
          </div>
        </section>

        {/* Social Proof/Testimonial */}
        <section className="px-4 py-16 sm:py-24 text-center">
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
            <svg className="w-12 h-12 text-[#4A90E2] mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <blockquote className="mb-6">
              <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                "FlowServe AI has revolutionized how we manage customer inquiries. It's like having an extra team member working 24/7. Our response time went from hours to seconds!"
              </p>
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-full flex items-center justify-center text-white font-bold text-lg">
                AY
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg">Amina Yusuf</div>
                <div className="text-sm text-white/60">Founder, Real Estate Connect Lagos</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-16 sm:py-24 bg-gradient-to-br from-[#4A90E2]/20 to-[#20C997]/20 backdrop-blur-sm border-y border-white/10">
          <div className="flex flex-col gap-8 items-center justify-center text-center max-w-3xl mx-auto">
            <div className="flex flex-col gap-4">
              <h3 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white">
                Ready to Automate Your Business?
              </h3>
              <p className="text-lg font-normal leading-normal text-white/70 max-w-2xl mx-auto">
                Install FlowServe AI now and start automating your Real Estate or Event Planning business with AI-powered WhatsApp assistant.
              </p>
            </div>
            
            {/* Install Button */}
            {isInstallable && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-3 rounded-full h-16 px-10 bg-gradient-to-r from-[#4A90E2] to-[#20C997] text-white text-xl font-bold shadow-2xl shadow-[#4A90E2]/50 hover:scale-105 transition-transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install FlowServe AI Now
              </button>
            )}

            {isInstalled && (
              <div className="flex items-center justify-center gap-3 rounded-full h-16 px-10 bg-[#20C997]/20 border-2 border-[#20C997]/50 text-[#20C997] text-xl font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                App Installed - Open to Get Started
              </div>
            )}
            
            <p className="text-sm text-white/50">No app store needed • Works on all devices • Free to install</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-8 md:p-12 bg-[#0A2540] border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A90E2] to-[#20C997] rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h5 className="text-xl font-bold text-white">FlowServe AI</h5>
              </div>
              <p className="text-sm text-white/60 max-w-sm mb-4">
                Automate your Real Estate or Event Planning business with AI-powered WhatsApp assistant. Built for Nigerian businesses.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h6 className="text-white font-bold mb-4">Product</h6>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-bold mb-4">Company</h6>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">© 2024 FlowServe AI. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span>Made with</span>
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>in Nigeria</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
