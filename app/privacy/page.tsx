import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect information you provide directly to us when you:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Create an account</li>
              <li>Update your profile</li>
              <li>Communicate with other users</li>
              <li>Contact our support team</li>
            </ul>
            <p>This information may include:</p>
            <ul className="list-disc pl-6">
              <li>Name and contact information</li>
              <li>Professional details and portfolio</li>
              <li>Location data</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6">
              <li>Provide and maintain our services</li>
              <li>Match clients with creative professionals</li>
              <li>Process payments and transactions</li>
              <li>Send service updates and marketing communications</li>
              <li>Improve our platform and user experience</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6">
              <li>Other users as part of the platform's functionality</li>
              <li>Service providers who assist in platform operations</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@brandconnect.com
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