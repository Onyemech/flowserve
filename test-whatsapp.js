// Test WhatsApp Bot
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://lzofgtjotkmrravxhwfk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2NTU4MCwiZXhwIjoyMDc5NjQxNTgwfQ.XSQBwNYZZCm5MxewH7r8oeWg09gLa4XCz5CezzRnO94';

async function testWhatsAppBot() {
  console.log('🧪 Testing WhatsApp Bot...\n');
  
  const testMessage = {
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: '2348158025887',
            text: { body: 'Hello, testing FlowServe AI bot' }
          }],
          contacts: [{
            profile: { name: 'Test User' }
          }]
        }
      }]
    }]
  };

  try {
    console.log('📤 Sending test message to WhatsApp agent...');
    console.log('Phone: +234 815 802 5887');
    console.log('Message: "Hello, testing FlowServe AI bot"\n');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(testMessage)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Bot processed the message');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ FAILED! Bot returned an error');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ ERROR! Failed to reach bot');
    console.log('Error:', error.message);
  }
}

testWhatsAppBot();
