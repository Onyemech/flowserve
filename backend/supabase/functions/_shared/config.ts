// Centralized configuration for easy management
export const config = {
  // AI Provider Configuration
  ai: {
    provider: Deno.env.get('AI_PROVIDER') || 'openai',
    apiKey: Deno.env.get('AI_API_KEY') || Deno.env.get('OPENAI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY') || '',
    model: Deno.env.get('AI_MODEL') || 'gpt-4o-mini',
  },
  
  // Supabase
  supabase: {
    url: Deno.env.get('SUPABASE_URL') || '',
    serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    anonKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
  },
  
  // WhatsApp - Single platform credentials for all admins
  whatsapp: {
    token: Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '',
    phoneNumberId: Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '',
    verifyToken: Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || 'flowserve_webhook_verify_2025',
    businessAccountId: Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID') || '',
    apiVersion: 'v21.0',
    apiUrl: 'https://graph.facebook.com/v21.0',
  },
  
  // Paystack
  paystack: {
    secretKey: Deno.env.get('PAYSTACK_SECRET_KEY') || '',
    publicKey: Deno.env.get('PAYSTACK_PUBLIC_KEY') || '',
  },
  
  // Cloudinary
  cloudinary: {
    cloudName: Deno.env.get('CLOUDINARY_CLOUD_NAME') || '',
    apiKey: Deno.env.get('CLOUDINARY_API_KEY') || '',
    apiSecret: Deno.env.get('CLOUDINARY_API_SECRET') || '',
  },
  
  // App
  app: {
    url: Deno.env.get('APP_URL') || 'http://localhost:3000',
  },
}

// Validate required config on startup
export function validateConfig(requiredKeys: string[]) {
  const missing: string[] = []
  
  for (const key of requiredKeys) {
    const keys = key.split('.')
    let value: any = config
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (!value) {
      missing.push(key)
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required config: ${missing.join(', ')}`)
  }
}
