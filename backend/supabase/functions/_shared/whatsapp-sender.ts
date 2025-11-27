import { config } from './config.ts'

export async function sendWhatsAppText(to: string, message: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.whatsapp.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message },
      }),
    })
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    throw error
  }
}

export async function sendWhatsAppImage(to: string, imageUrl: string, caption?: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`, {
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
          link: imageUrl,
          caption: caption,
        },
      }),
    })
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to send WhatsApp image:', error)
    throw error
  }
}
