'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    fetchProfile()
    
    // Listen for WhatsApp connection success from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'whatsapp_connected') {
        showToast('success', 'WhatsApp connected successfully!')
        fetchProfile()
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data, error } = await supabase
        .from('flowserve_users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: any) {
      showToast('error', error.message)
    }
  }

  const connectWhatsApp = async () => {
    setIsLoading(true)
    try {
      // Use platform-level WhatsApp credentials (already configured in backend)
      const supabase = createClient()
      const { error } = await supabase
        .from('flowserve_users')
        .update({
          whatsapp_connected: true,
          whatsapp_connected_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error

      showToast('success', 'WhatsApp connected! Your AI agent is now active.')
      fetchProfile()
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWhatsApp = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp? Your AI agent will stop working.')) {
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('flowserve_users')
        .update({
          whatsapp_phone_number_id: null,
          whatsapp_access_token: null,
          whatsapp_business_account_id: null,
          whatsapp_display_phone_number: null,
          whatsapp_connected: false,
        })
        .eq('id', userId)

      if (error) throw error

      showToast('success', 'WhatsApp disconnected')
      fetchProfile()
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-webhook`

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-40">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">WhatsApp Settings</h1>
        </div>
      </div>

      <div className="p-4">
        {profile?.whatsapp_connected && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 dark:text-green-200 font-medium">
              WhatsApp Connected
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Connected on {new Date(profile.whatsapp_connected_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {!profile?.whatsapp_connected ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Activate WhatsApp AI Agent
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click the button below to activate your AI agent. It will start responding to customer messages on WhatsApp automatically.
            </p>
            <button
              onClick={connectWhatsApp}
              disabled={isLoading}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50 transition-all inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {isLoading ? 'Activating...' : 'Activate AI Agent'}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Your AI agent will use the platform's WhatsApp Business number to respond to customers.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                WhatsApp Business Connected
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your AI agent is active and ready to respond to customers
              </p>
            </div>
            <button
              onClick={disconnectWhatsApp}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">WhatsApp Number</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Platform WhatsApp Business
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Connected On</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(profile.whatsapp_connected_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
