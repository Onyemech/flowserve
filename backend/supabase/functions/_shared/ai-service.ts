// AI Service Interface - Easy to swap providers
export interface AIProvider {
  analyzeIntent(message: string, context: any): Promise<IntentResult>
  generateResponse(prompt: string, context: any): Promise<string>
}

export interface IntentResult {
  action: 'show_listings' | 'select_item' | 'provide_date' | 'choose_payment' | 'unknown'
  confidence: number
  filters?: {
    maxPrice?: number
    bedrooms?: string
    location?: string
  }
  itemReference?: string
  paymentMethod?: 'paystack' | 'manual'
  eventDate?: string // ISO date string
  eventTime?: string
  guestCount?: number
  eventLocation?: string
}

// OpenAI Implementation
export class OpenAIProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey
    this.model = model
  }

  async analyzeIntent(message: string, context: any): Promise<IntentResult> {
    const systemPrompt = `You are an AI assistant for ${context.businessType === 'real_estate' ? 'a real estate business' : 'an event planning business'}.
Analyze the customer's message and determine their intent.

Available actions:
- show_listings: Customer wants to see available ${context.businessType === 'real_estate' ? 'properties' : 'services'}
- select_item: Customer is selecting a specific item (by number or name)
- provide_date: Customer is providing event date/time (for event planning)
- choose_payment: Customer is choosing a payment method
- unknown: Intent is unclear

Extract any filters mentioned (price, bedrooms, location).
If customer mentions a number or item name, extract it as itemReference.
If customer mentions a date, extract it as eventDate in ISO format (YYYY-MM-DD).
If customer mentions time, extract as eventTime (HH:MM).
If customer mentions guest count, extract as guestCount.

Respond ONLY with valid JSON in this format:
{
  "action": "show_listings",
  "confidence": 0.95,
  "filters": { "maxPrice": 5000000 },
  "itemReference": "1",
  "eventDate": "2025-12-25",
  "eventTime": "14:00",
  "guestCount": 100
}

Context: ${JSON.stringify(context.sessionContext || {})}`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      })

      const data = await response.json()
      const content = data.choices[0].message.content
      
      // Parse JSON response
      const result = JSON.parse(content)
      return result
    } catch (error) {
      console.error('OpenAI intent analysis failed:', error)
      // Fallback to keyword matching
      return this.fallbackIntentAnalysis(message, context)
    }
  }

  async generateResponse(prompt: string, context: any): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: `You are Kasungo AI, a helpful assistant for ${context.businessName}.` },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      })

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI response generation failed:', error)
      return 'I apologize, but I am having trouble processing your request. Please try again.'
    }
  }

  private fallbackIntentAnalysis(message: string, context: any): IntentResult {
    const lowerText = message.toLowerCase()
    
    // Check for payment choice
    if (context.sessionContext?.awaitingPayment) {
      if (lowerText.includes('1') || lowerText.includes('paystack')) {
        return { action: 'choose_payment', confidence: 0.9, paymentMethod: 'paystack' }
      }
      if (lowerText.includes('2') || lowerText.includes('manual')) {
        return { action: 'choose_payment', confidence: 0.9, paymentMethod: 'manual' }
      }
    }
    
    // Check for item selection
    if (/^\d+$/.test(lowerText.trim())) {
      return { action: 'select_item', confidence: 0.85, itemReference: lowerText.trim() }
    }
    
    // Check for listing request
    const listingKeywords = ['show', 'available', 'see', 'view', 'list', 'what', 'have', 'property', 'service']
    if (listingKeywords.some(kw => lowerText.includes(kw))) {
      const filters: any = {}
      
      const priceMatch = lowerText.match(/(\d+)m|under (\d+)|below (\d+)/)
      if (priceMatch) {
        filters.maxPrice = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) * 1000000
      }
      
      const bedroomMatch = lowerText.match(/(\d+)[\s-]?bedroom/)
      if (bedroomMatch) {
        filters.bedrooms = bedroomMatch[1]
      }
      
      return { action: 'show_listings', confidence: 0.8, filters }
    }
    
    // Check for interest/selection
    const interestKeywords = ['interested', 'want', 'buy', 'book', 'get']
    if (interestKeywords.some(kw => lowerText.includes(kw))) {
      return { action: 'select_item', confidence: 0.7, itemReference: message }
    }
    
    return { action: 'unknown', confidence: 0.5 }
  }
}

// Claude Implementation (ready to use)
export class ClaudeProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey
    this.model = model
  }

  async analyzeIntent(message: string, context: any): Promise<IntentResult> {
    const systemPrompt = `You are an AI assistant for ${context.businessType === 'real_estate' ? 'a real estate business' : 'an event planning business'}.
Analyze the customer's message and determine their intent.

Available actions:
- show_listings: Customer wants to see available ${context.businessType === 'real_estate' ? 'properties' : 'services'}
- select_item: Customer is selecting a specific item (by number or name)
- choose_payment: Customer is choosing a payment method
- unknown: Intent is unclear

Respond ONLY with valid JSON.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 200,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\nMessage: ${message}\nContext: ${JSON.stringify(context.sessionContext || {})}` }
          ],
        }),
      })

      const data = await response.json()
      const content = data.content[0].text
      const result = JSON.parse(content)
      return result
    } catch (error) {
      console.error('Claude intent analysis failed:', error)
      return this.fallbackIntentAnalysis(message, context)
    }
  }

  async generateResponse(prompt: string, context: any): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 300,
          messages: [
            { role: 'user', content: prompt }
          ],
        }),
      })

      const data = await response.json()
      return data.content[0].text
    } catch (error) {
      console.error('Claude response generation failed:', error)
      return 'I apologize, but I am having trouble processing your request. Please try again.'
    }
  }

  private fallbackIntentAnalysis(message: string, context: any): IntentResult {
    // Same fallback as OpenAI
    const lowerText = message.toLowerCase()
    
    if (context.sessionContext?.awaitingPayment) {
      if (lowerText.includes('1') || lowerText.includes('paystack')) {
        return { action: 'choose_payment', confidence: 0.9, paymentMethod: 'paystack' }
      }
      if (lowerText.includes('2') || lowerText.includes('manual')) {
        return { action: 'choose_payment', confidence: 0.9, paymentMethod: 'manual' }
      }
    }
    
    if (/^\d+$/.test(lowerText.trim())) {
      return { action: 'select_item', confidence: 0.85, itemReference: lowerText.trim() }
    }
    
    const listingKeywords = ['show', 'available', 'see', 'view', 'list', 'what', 'have']
    if (listingKeywords.some(kw => lowerText.includes(kw))) {
      return { action: 'show_listings', confidence: 0.8 }
    }
    
    return { action: 'unknown', confidence: 0.5 }
  }
}

// Factory to create AI provider based on config
export function createAIProvider(config: { provider: string; apiKey: string; model?: string }): AIProvider {
  switch (config.provider.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(config.apiKey, config.model)
    case 'claude':
      return new ClaudeProvider(config.apiKey, config.model)
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}
