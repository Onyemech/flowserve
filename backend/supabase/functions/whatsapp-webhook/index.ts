import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { config } from '../_shared/config.ts'

serve(async (req) => {
  // Set CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)

  // Handle GET request for webhook verification (Meta doesn't send auth headers)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    console.log('Webhook verification request:', { mode, token, challenge })

    // Check if mode and token are correct
    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      console.log('Webhook verified successfully')
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    console.error('Webhook verification failed', { mode, token, expected: config.whatsapp.verifyToken })
    return new Response('Forbidden', {
      status: 403,
      headers: corsHeaders,
    })
  }

  // Handle POST request for incoming messages
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      console.log('Incoming webhook:', JSON.stringify(body, null, 2))

      // Extract phone number ID from metadata to identify which admin this message is for
      const phoneNumberId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id
      console.log('Message received for phone_number_id:', phoneNumberId)

      // Process webhook data
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const value = change.value
              const phoneNumberId = value.metadata?.phone_number_id

              // Handle incoming messages
              if (value.messages) {
                for (const message of value.messages) {
                  console.log('New message:', {
                    from: message.from,
                    type: message.type,
                    phoneNumberId: phoneNumberId,
                    timestamp: message.timestamp,
                  })

                  // Process message with AI agent
                  // The agent will handle routing based on the customer's phone number
                  await processIncomingMessage(message, value.metadata)
                }
              }

              // Handle message status updates
              if (value.statuses) {
                for (const status of value.statuses) {
                  console.log('Message status:', {
                    id: status.id,
                    status: status.status,
                    timestamp: status.timestamp,
                  })

                  // TODO: Update message status in database
                  await updateMessageStatus(status)
                }
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Webhook processing error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: corsHeaders,
  })
})

async function processIncomingMessage(message: any, metadata: any) {
  try {
    // Extract message details
    const from = message.from
    const messageType = message.type
    const timestamp = message.timestamp

    let messageText = ''
    let mediaUrl = ''

    // Extract message content based on type
    switch (messageType) {
      case 'text':
        messageText = message.text?.body || ''
        break
      case 'image':
        mediaUrl = message.image?.id || ''
        messageText = message.image?.caption || ''
        break
      case 'video':
        mediaUrl = message.video?.id || ''
        messageText = message.video?.caption || ''
        break
      case 'audio':
        mediaUrl = message.audio?.id || ''
        break
      case 'document':
        mediaUrl = message.document?.id || ''
        messageText = message.document?.caption || ''
        break
      default:
        console.log('Unsupported message type:', messageType)
        return
    }

    console.log('Processing message:', {
      from,
      type: messageType,
      text: messageText,
      media: mediaUrl,
    })

    // Call AI agent to process and respond (includes phoneNumberId for routing)
    const agentResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-agent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          entry: [{
            changes: [{
              value: {
                messages: [message],
                metadata: metadata,
              },
            }],
          }],
        }),
      }
    )

    if (!agentResponse.ok) {
      throw new Error(`Agent response failed: ${agentResponse.statusText}`)
    }

    console.log('Message processed by agent successfully')
  } catch (error) {
    console.error('Error processing message:', error)
  }
}

async function updateMessageStatus(status: any) {
  try {
    console.log('Updating message status:', {
      messageId: status.id,
      status: status.status,
      timestamp: status.timestamp,
    })

    // TODO: Update message status in database
    // This will track delivery, read, sent, failed statuses
  } catch (error) {
    console.error('Error updating message status:', error)
  }
}
