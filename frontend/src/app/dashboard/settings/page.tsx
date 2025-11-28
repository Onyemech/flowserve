'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
    whatsapp_webhook_verify_token: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('flowserve_users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setFormData({
        whatsapp_phone_number_id: data.whatsapp_phone_number_id || '',
        whatsapp_access_token: data.whatsapp_access_token || '',
        whatsapp_webhook_verify_token: data.whatsapp_webhook_verify_token || '',
      })
    } catch (error: any) {
      showToast('error', error.message)
    }
  }

  const testConnection = async () => {
    if (!formData.whatsapp_phone_number_id || !formData.whatsapp_access_token) {
      showToast('error', 'Please enter Phone Number ID and Access Token')
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch('/api/whatsapp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number_id: formData.whatsapp_phone_number_id,
          access_token: formData.whatsapp_access_token,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      showToast('success', 'WhatsApp connection successful!')
    } catch (error: any) {
      showToast('error', error.message || 'Connection test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('flowserve_users')
        .update({
          whatsapp_phone_number_id: formData.whatsapp_phone_number_id,
          whatsapp_access_token: formData.whatsapp_access_token,
          whatsapp_webhook_verify_token: formData.whatsapp_webhook_verify_token,
          whatsapp_connected: true,
          whatsapp_connected_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      showToast('success', 'WhatsApp settings saved!')
      fetchProfile()
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-webhook`

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Connect your WhatsApp Business account to activate the AI agent
      </p>

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

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          How to Get Your WhatsApp Credentials
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Developer Console</a></li>
          <li>Create a WhatsApp Business App (or use existing)</li>
          <li>Go to WhatsApp → Getting Started</li>
          <li>Copy your <strong>Phone Number ID</strong></li>
          <li>Copy your <strong>Access Token</strong> (or generate permanent token)</li>
          <li>Create a custom <strong>Verify Token</strong> (any random string)</li>
        </ol>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Phone Number ID
          </label>
          <input
            type="text"
            value={formData.whatsapp_phone_number_id}
            onChange={(e) => setFormData({ ...formData, whatsapp_phone_number_id: e.target.value })}
            placeholder="1572646177519931"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Access Token
          </label>
          <input
            type="password"
            value={formData.whatsapp_access_token}
            onChange={(e) => setFormData({ ...formData, whatsapp_access_token: e.target.value })}
            placeholder="EAABsbCS1iHgBO7ZA..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Webhook Verify Token (create your own)
          </label>
          <input
            type="text"
            value={formData.whatsapp_webhook_verify_token}
            onChange={(e) => setFormData({ ...formData, whatsapp_webhook_verify_token: e.target.value })}
            placeholder="my_secret_verify_token_2025"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create any random string - you'll need this when configuring webhook in Meta
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={testConnection}
            disabled={isTesting}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Configure Webhook in Meta
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          After saving your credentials, configure the webhook in Meta Developer Console:
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Callback URL:</p>
          <code className="text-sm text-blue-600 dark:text-blue-400 break-all">{webhookUrl}</code>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Verify Token:</p>
          <code className="text-sm text-blue-600 dark:text-blue-400">
            {formData.whatsapp_webhook_verify_token || 'Enter verify token above'}
          </code>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Subscribe to: <strong>messages</strong> webhook field
        </p>
      </div>
    </div>
  )
}
