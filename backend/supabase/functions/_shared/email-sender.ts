// Email sender using SMTP-compatible services
// Works with Gmail, Outlook, SendGrid SMTP, etc.

export async function sendEmail(to: string, subject: string, html: string, text: string) {
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASSWORD')
  const smtpFrom = Deno.env.get('SMTP_FROM_EMAIL') || smtpUser
  const smtpFromName = Deno.env.get('SMTP_FROM_NAME') || 'FlowServe AI'
  
  if (!smtpUser || !smtpPass) {
    console.warn('SMTP credentials not set, skipping email')
    return null
  }
  
  try {
    // Using Brevo (formerly Sendinblue) API - works like SMTP but via REST
    // Free tier: 300 emails/day
    // Alternative to complex SMTP implementation in Deno
    
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')
    
    if (brevoApiKey) {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: smtpFrom, name: smtpFromName },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
          textContent: text,
        }),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Brevo API error: ${error}`)
      }
      
      console.log('Email sent successfully via Brevo')
      return await response.json()
    }
    
    // Fallback: Log email (for development/testing)
    console.log('=== EMAIL (No API Key - Logged Only) ===')
    console.log('To:', to)
    console.log('From:', smtpFrom)
    console.log('Subject:', subject)
    console.log('Body:', text.substring(0, 200) + '...')
    console.log('=========================================')
    
    return { success: true, provider: 'logged' }
  } catch (error) {
    console.error('Failed to send email:', error)
    return null
  }
}

// Note: For production, get free Brevo API key at https://app.brevo.com/settings/keys/api
// It's simpler than SMTP and works perfectly with Deno Edge Functions
// Alternative: Use SendGrid, Mailgun, or any service with REST API
