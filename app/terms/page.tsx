import { Card, CardContent } from "@/components/ui/card"

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using BrandConnect, you agree to be bound by these Terms of Service.
              If you disagree with any part of these terms, you may not access our service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <ul className="list-disc pl-6">
              <li>You must be 18 years or older to use this service</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You may not use another user's account without permission</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">3. Platform Rules</h2>
            <p className="mb-4">Users must:</p>
            <ul className="list-disc pl-6">
              <li>Provide accurate professional information</li>
              <li>Maintain professional conduct in all interactions</li>
              <li>Respect intellectual property rights</li>
              <li>Not engage in fraudulent or deceptive practices</li>
              <li>Not use the platform for unauthorized commercial purposes</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">4. Content and Services</h2>
            <ul className="list-disc pl-6">
              <li>Users retain ownership of their content</li>
              <li>Platform may review and remove inappropriate content</li>
              <li>Services are provided "as is" without warranties</li>
              <li>Platform reserves the right to modify or discontinue services</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">5. Payments and Fees</h2>
            <ul className="list-disc pl-6">
              <li>Users agree to pay all applicable fees</li>
              <li>Payment terms are specified in service agreements</li>
              <li>Refunds are subject to platform policies</li>
              <li>Platform may change fee structure with notice</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our service immediately,
              without prior notice or liability, for any reason whatsoever, including without
              limitation if you breach the Terms.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p>
              In no event shall BrandConnect, nor its directors, employees, partners, agents,
              suppliers, or affiliates, be liable for any indirect, incidental, special,
              consequential or punitive damages.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users
              of any material changes via email or platform notification.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to us at:
              <br />
              Email: legal@brandconnect.com
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}