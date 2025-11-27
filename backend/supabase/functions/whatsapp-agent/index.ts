import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createAIProvider } from '../_shared/ai-service.ts'
import { config, validateConfig } from '../_shared/config.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validate required config
validateConfig([
  'ai.apiKey',
  'supabase.url',
  'supabase.serviceRoleKey',
  'whatsapp.token',
  'whatsapp.phoneNumberId',
])

// Initialize AI provider (easily swap between OpenAI, Claude, etc.)
const aiProvider = createAIProvider(config.ai)

interface WhatsAppMessage {
  from: string
  text: string
  name?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    const message = extractMessage(body)
    if (!message) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )

    const session = await getOrCreateSession(supabase, message.from)
    
    const { data: owner } = await supabase
      .from('flowserve_users')
      .select('*')
      .eq('id', session.user_id)
      .single()

    if (!owner) {
      throw new Error('Business owner not found')
    }

    const response = await processMessage(supabase, message, session, owner)
    
    await sendWhatsAppMessage(message.from, response.text, response.media)
    
    await supabase
      .from('whatsapp_sessions')
      .update({
        session_data: response.sessionData,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('WhatsApp agent error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function extractMessage(body: any): WhatsAppMessage | null {
  try {
    const entry = body.entry?.[0]
    const change = entry?.changes?.[0]
    const message = change?.value?.messages?.[0]
    
    if (!message) return null

    return {
      from: message.from,
      text: message.text?.body || '',
      name: change?.value?.contacts?.[0]?.profile?.name,
    }
  } catch {
    return null
  }
}

async function getOrCreateSession(supabase: any, phone: string) {
  const { data: existing } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('customer_phone', phone)
    .gte('last_message_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .single()

  if (existing) return existing

  const { data: owner } = await supabase
    .from('flowserve_users')
    .select('id')
    .limit(1)
    .single()

  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .insert({
      user_id: owner.id,
      customer_phone: phone,
      session_data: { messages: [], context: {} },
    })
    .select()
    .single()

  return session
}

async function processMessage(supabase: any, message: WhatsAppMessage, session: any, owner: any) {
  const sessionData = session.session_data || { messages: [], context: {} }
  sessionData.messages.push({ role: 'user', content: message.text })

  if (sessionData.messages.length === 1) {
    return {
      text: `Hello! I am Kasungo AI, welcome to ${owner.business_name}! 👋\n\nHow can I help you today?`,
      media: [],
      sessionData,
    }
  }

  // Use AI to analyze intent
  const intent = await aiProvider.analyzeIntent(message.text, {
    businessType: owner.business_type,
    businessName: owner.business_name,
    sessionContext: sessionData.context,
  })
  
  console.log('AI Intent:', intent)
  
  // Handle based on intent with confidence threshold
  if (intent.confidence < 0.5) {
    // Low confidence - ask for clarification
    const clarification = await aiProvider.generateResponse(
      `The customer said: "${message.text}". Generate a friendly clarification question for a ${owner.business_type} business.`,
      { businessName: owner.business_name }
    )
    return {
      text: clarification,
      media: [],
      sessionData,
    }
  }
  
  if (intent.action === 'show_listings') {
    return await handleShowListings(supabase, owner, intent, sessionData)
  }
  
  if (intent.action === 'select_item') {
    return await handleItemSelection(supabase, owner, intent, sessionData)
  }
  
  if (intent.action === 'choose_payment') {
    return await handlePaymentChoice(supabase, owner, intent, sessionData)
  }
  
  // Unknown intent - provide helpful options
  return {
    text: `I can help you with:\n\n${owner.business_type === 'real_estate' ? '🏠 View available properties\n💰 Purchase properties' : '🎉 View our services\n📅 Book services'}\n\nWhat would you like to do?`,
    media: [],
    sessionData,
  }
}

// Removed - now using AI service

async function handleShowListings(supabase: any, owner: any, intent: any, sessionData: any) {
  const tableName = owner.business_type === 'real_estate' ? 'properties' : 'services'
  
  let query = supabase
    .from(tableName)
    .select('*')
    .eq('user_id', owner.id)
  
  if (tableName === 'properties') {
    query = query.is('deleted_at', null).eq('status', 'available')
  }
  
  const { data: items } = await query
  
  if (!items || items.length === 0) {
    return {
      text: `Sorry, we have no ${owner.business_type === 'real_estate' ? 'properties' : 'services'} available at the moment.`,
      media: [],
      sessionData,
    }
  }
  
  let filtered = items
  if (intent.filters?.maxPrice) {
    filtered = filtered.filter((item: any) => item.price <= intent.filters.maxPrice)
  }
  if (intent.filters?.bedrooms) {
    filtered = filtered.filter((item: any) => 
      item.title?.toLowerCase().includes(`${intent.filters.bedrooms} bedroom`) ||
      item.description?.toLowerCase().includes(`${intent.filters.bedrooms} bedroom`)
    )
  }
  
  const itemsToShow = filtered.length > 0 ? filtered : items
  
  return {
    text: filtered.length === 0 
      ? 'No items match your criteria. Here are all available options:'
      : `Here are ${filtered.length} available ${owner.business_type === 'real_estate' ? 'properties' : 'services'}:`,
    media: itemsToShow.slice(0, 5).map((item: any, idx: number) => ({
      type: 'image',
      url: item.images?.[0] || '',
      caption: formatItemCaption(item, idx + 1, owner.business_type),
    })),
    sessionData: { ...sessionData, context: { ...sessionData.context, availableItems: itemsToShow } },
  }
}

async function handleItemSelection(supabase: any, owner: any, intent: any, sessionData: any) {
  const availableItems = sessionData.context.availableItems || []
  
  if (availableItems.length === 0) {
    return {
      text: `Please first view our ${owner.business_type === 'real_estate' ? 'properties' : 'services'} by typing "show available"`,
      media: [],
      sessionData,
    }
  }
  
  let selectedItem = null
  
  // Try to match by number first
  if (intent.itemReference && /^\d+$/.test(intent.itemReference)) {
    const index = parseInt(intent.itemReference) - 1
    selectedItem = availableItems[index]
  } else if (intent.itemReference) {
    // Fuzzy match by name using AI or simple includes
    selectedItem = availableItems.find((item: any) => {
      const itemName = (item.title || item.name).toLowerCase()
      const reference = intent.itemReference.toLowerCase()
      return itemName.includes(reference) || reference.includes(itemName)
    })
  }
  
  if (!selectedItem) {
    return {
      text: 'I couldn\'t find that item. Please reply with the number (e.g., "1") or name of the item you\'re interested in.',
      media: [],
      sessionData,
    }
  }
  
  const itemName = selectedItem.title || selectedItem.name
  
  return {
    text: `Great choice! You selected:\n\n${itemName}\n₦${selectedItem.price.toLocaleString()}\n\nTo proceed, please choose a payment option:\n\n1️⃣ Paystack (Instant confirmation)\n2️⃣ Manual Payment (5 minutes - 14 hours)\n\nReply with 1 or 2`,
    media: [],
    sessionData: {
      ...sessionData,
      context: {
        ...sessionData.context,
        selectedItem,
        awaitingPayment: true,
      },
    },
  }
}

async function handlePaymentChoice(supabase: any, owner: any, intent: any, sessionData: any) {
  const selectedItem = sessionData.context.selectedItem
  
  if (!selectedItem) {
    return {
      text: 'Please first select an item you want to purchase.',
      media: [],
      sessionData,
    }
  }
  
  const paymentMethod = intent.paymentMethod || (intent.itemReference === '1' ? 'paystack' : 'manual')
  
  if (paymentMethod === 'paystack') {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: owner.id,
        customer_phone: sessionData.customer_phone,
        order_type: owner.business_type === 'real_estate' ? 'property' : 'service',
        item_id: selectedItem.id,
        amount: selectedItem.price,
        payment_method: 'paystack',
        payment_status: 'pending',
      })
      .select()
      .single()
    
    const paymentUrl = `${config.app.url}/payment/create?order=${order.id}`
    
    return {
      text: `Click the link below to pay with Paystack:\n\n${paymentUrl}\n\nYou'll receive instant confirmation once payment is complete!`,
      media: [],
      sessionData: {
        ...sessionData,
        context: {
          ...sessionData.context,
          orderId: order.id,
          paymentMethod: 'paystack',
          awaitingPayment: false,
        },
      },
    }
  } else {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: owner.id,
        customer_phone: sessionData.customer_phone,
        order_type: owner.business_type === 'real_estate' ? 'property' : 'service',
        item_id: selectedItem.id,
        amount: selectedItem.price,
        payment_method: 'manual',
        payment_status: 'pending',
      })
      .select()
      .single()
    
    return {
      text: `For manual payment, please transfer ₦${selectedItem.price.toLocaleString()} to:\n\n🏦 Bank: ${owner.bank_name}\n💳 Account: ${owner.account_number}\n👤 Name: ${owner.account_name}\n\nAfter payment, our team will confirm within 5 minutes to 14 hours. Thank you!`,
      media: [],
      sessionData: {
        ...sessionData,
        context: {
          ...sessionData.context,
          orderId: order.id,
          paymentMethod: 'manual',
          awaitingPayment: false,
        },
      },
    }
  }
}

function formatItemCaption(item: any, number: number, businessType: string) {
  const name = item.title || item.name
  const price = `₦${item.price.toLocaleString()}`
  const location = item.location ? `\n📍 ${item.location}` : ''
  const description = item.description ? `\n\n${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}` : ''
  
  return `${number}. ${name}\n${price}${location}${description}\n\nReply "${number}" to select this ${businessType === 'real_estate' ? 'property' : 'service'}`
}

async function sendWhatsAppMessage(to: string, text: string, media: any[]) {
  await fetch(`https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.whatsapp.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text },
    }),
  })

  for (const item of media) {
    if (item.url) {
      await fetch(`https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.whatsapp.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'image',
          image: {
            link: item.url,
            caption: item.caption,
          },
        }),
      })
    }
  }
}
