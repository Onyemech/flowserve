import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#103358] to-[#0A2540] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-white via-[#50E3C2] to-[#4A90E2] bg-clip-text text-transparent">
              FlowServe AI
            </div>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-white/70">Last updated: December 4, 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">1. Acceptance of Terms</h2>
            <p className="text-white/80 leading-relaxed">
              By accessing and using FlowServe AI ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">2. Description of Service</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              FlowServe AI provides an AI-powered WhatsApp automation platform for Real Estate and Event Planning businesses. Our Service includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Automated WhatsApp customer conversations</li>
              <li>AI-powered response generation</li>
              <li>Payment processing via Paystack</li>
              <li>Order and customer management</li>
              <li>Invoice generation and delivery</li>
              <li>Property and service listing management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">3. User Accounts</h2>
            <div className="space-y-4 text-white/80">
              <div>
                <h3 className="font-semibold text-white mb-2">3.1 Registration</h3>
                <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">3.2 WhatsApp Business Account</h3>
                <p>You must have a valid WhatsApp Business account and comply with Meta's WhatsApp Business Terms of Service.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">3.3 Account Termination</h3>
                <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">4. Acceptable Use</h2>
            <p className="text-white/80 mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Send spam or unsolicited messages via WhatsApp</li>
              <li>Violate Meta's WhatsApp Business Policy</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Reverse engineer or copy our AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">5. Payment Terms</h2>
            <div className="space-y-4 text-white/80">
              <div>
                <h3 className="font-semibold text-white mb-2">5.1 Payment Processing</h3>
                <p>All payments are processed securely through Paystack. We do not store your customers' payment card information.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">5.2 Transaction Fees</h3>
                <p>Paystack transaction fees apply to all payments. These fees are deducted before funds are transferred to your bank account.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">5.3 Refunds</h3>
                <p>Refunds are handled between you and your customers. We are not responsible for refund disputes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">6. AI-Generated Content</h2>
            <p className="text-white/80 leading-relaxed">
              Our AI generates responses based on your business information and customer inquiries. While we strive for accuracy, you are responsible for reviewing and ensuring the appropriateness of AI-generated content. We are not liable for any errors or misunderstandings in AI responses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">7. Data Ownership</h2>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>You retain ownership of your business data, customer information, and content</li>
              <li>We retain ownership of our AI models, software, and platform</li>
              <li>You grant us a license to use your data to provide the Service</li>
              <li>You can export or delete your data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">8. Service Availability</h2>
            <p className="text-white/80 leading-relaxed">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience downtime. We are not liable for any losses resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">9. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed">
              To the maximum extent permitted by law, FlowServe AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">10. Indemnification</h2>
            <p className="text-white/80 leading-relaxed">
              You agree to indemnify and hold FlowServe AI harmless from any claims, damages, or expenses arising from your use of the Service, violation of these terms, or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">11. Third-Party Services</h2>
            <p className="text-white/80 mb-4">Our Service integrates with:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Meta/WhatsApp Business API</li>
              <li>OpenAI for AI processing</li>
              <li>Paystack for payments</li>
              <li>Cloudinary for image storage</li>
            </ul>
            <p className="text-white/80 mt-4">You must comply with each third-party service's terms of use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">12. Intellectual Property</h2>
            <p className="text-white/80 leading-relaxed">
              All intellectual property rights in the Service, including software, AI models, design, and branding, belong to FlowServe AI. You may not copy, modify, or distribute our intellectual property without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">13. Termination</h2>
            <p className="text-white/80 leading-relaxed">
              You may terminate your account at any time. We may terminate or suspend your account for violations of these terms. Upon termination, you will lose access to the Service, but your data will be available for export for 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">14. Changes to Terms</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify you of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">15. Governing Law</h2>
            <p className="text-white/80 leading-relaxed">
              These terms are governed by the laws of Nigeria. Any disputes shall be resolved in Nigerian courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">16. Contact Information</h2>
            <p className="text-white/80 leading-relaxed">
              For questions about these Terms of Service, contact us at:
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-white">Email: onyemechicaleb4@gmail.com</p>
              <p className="text-white">Website: https://flowserve.vercel.app</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <Link href="/privacy" className="text-[#50E3C2] hover:underline">
            View Privacy Policy
          </Link>
          <div className="text-white/50 text-sm">
            © 2024 FlowServe AI. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
