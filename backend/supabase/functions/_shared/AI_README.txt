AI SERVICE - PROVIDER CONFIGURATION
====================================

The WhatsApp agent uses a loosely coupled AI service that supports multiple providers.
You can easily switch between OpenAI, Claude, or add new providers without changing the agent code.

CURRENT PROVIDERS
-----------------
1. OpenAI (gpt-4o-mini, gpt-4, gpt-3.5-turbo)
2. Claude (claude-3-5-sonnet, claude-3-opus, claude-3-haiku)

SWITCHING PROVIDERS
-------------------

To use OpenAI (default):
supabase secrets set AI_PROVIDER=openai
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set AI_MODEL=gpt-4o-mini

To use Claude:
supabase secrets set AI_PROVIDER=claude
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set AI_MODEL=claude-3-5-sonnet-20241022

ADDING NEW PROVIDERS
--------------------

1. Open: backend/supabase/functions/_shared/ai-service.ts

2. Create a new class implementing AIProvider interface:

export class GeminiProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = 'gemini-pro') {
    this.apiKey = apiKey
    this.model = model
  }

  async analyzeIntent(message: string, context: any): Promise<IntentResult> {
    // Your Gemini API call here
  }

  async generateResponse(prompt: string, context: any): Promise<string> {
    // Your Gemini API call here
  }
}

3. Add to factory function:

export function createAIProvider(config: { provider: string; apiKey: string; model?: string }): AIProvider {
  switch (config.provider.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(config.apiKey, config.model)
    case 'claude':
      return new ClaudeProvider(config.apiKey, config.model)
    case 'gemini':  // Add this
      return new GeminiProvider(config.apiKey, config.model)
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}

4. Deploy:
supabase functions deploy whatsapp-agent

5. Configure:
supabase secrets set AI_PROVIDER=gemini
supabase secrets set GEMINI_API_KEY=your_key
supabase secrets set AI_MODEL=gemini-pro

DONE! The agent now uses your new provider.

HOW IT WORKS
------------
The AI service provides two main functions:

1. analyzeIntent() - Understands what the customer wants
   Returns: { action, confidence, filters, itemReference, paymentMethod }

2. generateResponse() - Generates natural language responses
   Returns: string

The agent calls these functions without knowing which provider is being used.
This is called "loose coupling" - the agent depends on the interface, not the implementation.

BENEFITS
--------
- Switch providers without code changes
- Test different models easily
- Fallback to keyword matching if AI fails
- Add new providers without touching agent code
- Compare costs and performance between providers

COST OPTIMIZATION
-----------------
OpenAI gpt-4o-mini: ~$0.15 per 1M input tokens (cheapest)
Claude 3.5 Sonnet: ~$3 per 1M input tokens (best quality)
Claude 3 Haiku: ~$0.25 per 1M input tokens (fast & cheap)

For production, start with gpt-4o-mini, monitor quality, upgrade if needed.
