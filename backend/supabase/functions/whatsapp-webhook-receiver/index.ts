import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Handle WhatsApp webhook verification
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')
      
      if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN')) {
        return new Response(challenge, {
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        })
      }
      
      return new Response('Forbidden', { status: 403 })
    }

    // Process incoming WhatsApp message
    const body = await req.json()
    
    // Call our WhatsApp agent
    const agentUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-agent`
    const agentResponse = await fetch(agentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify(body),
    })
    
    if (!agentResponse.ok) {
      throw new Error('Agent processing failed')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
