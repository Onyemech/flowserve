// Email Service using SMTP
export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPassword = Deno.env.get('SMTP_PASSWORD')
  const smtpFrom = Deno.env.get('SMTP_FROM_EMAIL') || smtpUser
  const smtpFromName = Deno.env.get('SMTP_FROM_NAME') || 'FlowServe AI'

  if (!smtpUser || !smtpPassword) {
    console.error('SMTP credentials not configured')
    return false
  }

  try {
    // Using a simple fetch to an email API service
    // For production, you might want to use a service like SendGrid, Resend, or Brevo
    
    // For now, we'll use Brevo (formerly Sendinblue) API if available
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
          sender: {
            name: smtpFromName,
            email: smtpFrom,
          },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text || options.html.replace(/<[^>]*>/g, ''),
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Brevo email failed:', error)
        return false
      }

      console.log('Email sent successfully via Brevo')
      return true
    }

    // Fallback: Log email (for development)
    console.log('Email would be sent to:', options.to)
    console.log('Subject:', options.subject)
    console.log('SMTP not fully configured, email logged only')
    
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}
