import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/70">Last updated: December 4, 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              FlowServe AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our WhatsApp AI automation platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">2. Information We Collect</h2>
            <div className="space-y-4 text-white/80">
              <div>
                <h3 className="font-semibold text-white mb-2">2.1 Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full name and business name</li>
                  <li>Email address</li>
                  <li>Business type (Real Estate or Event Planning)</li>
                  <li>Bank account details for payment processing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2.2 WhatsApp Business Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>WhatsApp Business phone number</li>
                  <li>WhatsApp Business Account ID</li>
                  <li>Access tokens for API integration</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2.3 Customer Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Customer phone numbers and names</li>
                  <li>WhatsApp conversation history</li>
                  <li>Order and payment information</li>
                  <li>Property or service inquiries</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Provide and maintain our AI automation services</li>
              <li>Process payments and transactions via Paystack</li>
              <li>Send automated WhatsApp responses to your customers</li>
              <li>Generate invoices and manage orders</li>
              <li>Improve our AI models and service quality</li>
              <li>Send important service updates and notifications</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">4. Data Sharing and Disclosure</h2>
            <div className="space-y-4 text-white/80">
              <p>We share your information only with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Meta/WhatsApp:</strong> To send and receive messages via WhatsApp Business API</li>
                <li><strong>OpenAI:</strong> To process AI-powered conversations (messages are not stored by OpenAI)</li>
                <li><strong>Paystack:</strong> To process payments securely</li>
                <li><strong>Cloudinary:</strong> To store and serve property/service images</li>
                <li><strong>Supabase:</strong> Our secure database provider</li>
              </ul>
              <p className="mt-4">We do not sell your personal information to third parties.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">5. Data Security</h2>
            <p className="text-white/80 leading-relaxed">
              We implement industry-standard security measures including encryption, secure HTTPS connections, and access controls. Your WhatsApp access tokens and sensitive data are encrypted at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>WhatsApp conversation sessions: 24 hours</li>
              <li>Order and payment records: 7 years (for tax compliance)</li>
              <li>Customer data: Until you delete it or close your account</li>
              <li>Account information: Until you request deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">7. Your Rights</h2>
            <p className="text-white/80 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Disconnect your WhatsApp Business account at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">8. Cookies and Tracking</h2>
            <p className="text-white/80 leading-relaxed">
              We use essential cookies for authentication and session management. We do not use tracking cookies or third-party analytics that collect personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">9. Children's Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              Our service is not intended for users under 18 years of age. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">10. Changes to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#50E3C2]">11. Contact Us</h2>
            <p className="text-white/80 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-white">Email: onyemechicaleb4@gmail.com</p>
              <p className="text-white">Website: https://flowserve.vercel.app</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <Link href="/terms" className="text-[#50E3C2] hover:underline">
            View Terms of Service
          </Link>
          <div className="text-white/50 text-sm">
            © 2024 FlowServe AI. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
