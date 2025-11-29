import fetch from 'node-fetch';

const SUPABASE_URL = 'https://lzofgtjotkmrravxhwfk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2NTU4MCwiZXhwIjoyMDc5NjQxNTgwfQ.XSQBwNYZZCm5MxewH7r8oeWg09gLa4XCz5CezzRnO94';

async function sendWebhook(phone, text) {
    const payload = {
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        from: phone,
                        text: { body: text }
                    }],
                    contacts: [{
                        profile: { name: 'Test User' }
                    }]
                }
            }]
        }]
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-agent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify(payload)
    });

    return response.json();
}

async function testRouting() {
    console.log('🧪 Testing Routing Scenarios...\n');

    const randomPhone = '2348158025887';
    console.log(`📱 Using random phone: ${randomPhone}`);

    // Scenario 1: New User -> Should ask for business name
    console.log('\n--- Scenario 1: New User ---');
    const res1 = await sendWebhook(randomPhone, 'Hello');
    console.log('Response:', JSON.stringify(res1, null, 2));

    // Scenario 2: Try to join a non-existent business
    console.log('\n--- Scenario 2: Join Non-Existent Business ---');
    const res2 = await sendWebhook(randomPhone, 'NonExistentBusiness123');
    console.log('Response:', JSON.stringify(res2, null, 2));

    // Scenario 3: Try to join an existing business (Need a real business name here)
    // I'll try "FlowServe" or something generic, or just observe the logs if I can.
    // For now, let's just see if Scenario 1 works as expected.
}

testRouting();
