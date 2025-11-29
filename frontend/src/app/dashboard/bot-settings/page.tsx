'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Bot, MessageSquare, Zap, CheckCircle, XCircle, RefreshCw, Copy } from 'lucide-react';
import BottomNav from '@/components/dashboard/BottomNav';

export default function BotSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [testingBot, setTestingBot] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('flowserve_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function testBot() {
    setTestingBot(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-webhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entry: [{
              changes: [{
                value: {
                  messages: [{
                    from: '1234567890',
                    text: { body: 'test' },
                  }],
                  contacts: [{
                    profile: { name: 'Test User' },
                  }],
                },
              }],
            }],
          }),
        }
      );

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Bot is working correctly! Test message processed successfully.',
        });
      } else {
        setTestResult({
          success: false,
          message: 'Bot test failed. Please check your configuration.',
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Error testing bot: ' + error.message,
      });
    } finally {
      setTestingBot(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">WhatsApp Bot Settings</h1>
        </div>
        <p className="text-blue-100 text-sm">Configure your AI assistant</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Bot Status Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Bot Status</h2>
                <p className="text-sm text-gray-600">Active (Managed by Platform)</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Active
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Your AI Assistant is ready!
              </span>
            </div>
            <p className="text-xs text-green-600 mt-2">
              Customers can start chatting with your business immediately.
            </p>
          </div>

          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Smart Connection Link (Share this with customers):</p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <code className="text-xs text-gray-800 flex-1 break-all">
                {`https://wa.me/${process.env.NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER || '15550239843'}?text=I want to connect with ${profile?.business_name || '...'}`}
              </code>
              <button
                onClick={() => {
                  const link = `https://wa.me/${process.env.NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER || '15550239843'}?text=I want to connect with ${profile?.business_name || '...'}`;
                  navigator.clipboard.writeText(link);
                  alert('Link copied!');
                }}
                className="p-2 hover:bg-gray-200 rounded-md text-gray-500"
                title="Copy Link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              When customers click this link, they will be instantly connected to your business.
            </p>
          </div>

          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Your Business Name (for manual connection):</p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="font-mono font-bold text-gray-800 flex-1">{profile?.business_name || 'Your Business Name'}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profile?.business_name || '');
                  alert('Copied to clipboard!');
                }}
                className="p-2 hover:bg-gray-200 rounded-md text-gray-500"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tell your customers to message our WhatsApp number and type your business name to start.
            </p>
          </div>
        </div>

        {/* Test Bot */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Test Bot</h2>
              <p className="text-sm text-gray-600">Send a test message to verify bot is working</p>
            </div>
          </div>

          <button
            onClick={testBot}
            disabled={testingBot}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {testingBot ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Test Bot
              </>
            )}
          </button>

          {testResult && (
            <div className={`mt-4 p-3 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                  {testResult.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bot Capabilities */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Bot Capabilities</h2>
              <p className="text-sm text-gray-600">What your AI assistant can do</p>
            </div>
          </div>

          <div className="space-y-3">
            <CapabilityItem
              icon="🏠"
              title={profile?.business_type === 'real_estate' ? 'Show Properties' : 'Show Services'}
              description={`Display available ${profile?.business_type === 'real_estate' ? 'properties' : 'services'} with images and details`}
            />
            <CapabilityItem
              icon="💬"
              title="Answer Questions"
              description="Respond to customer inquiries intelligently"
            />
            <CapabilityItem
              icon="💳"
              title="Process Payments"
              description="Handle Paystack and manual payment options"
            />
            <CapabilityItem
              icon="📸"
              title="Send Images"
              description="Share property/service images via WhatsApp"
            />
            <CapabilityItem
              icon="🤖"
              title="AI-Powered"
              description="Uses advanced AI to understand customer intent"
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function CapabilityItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
