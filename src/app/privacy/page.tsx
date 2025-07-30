import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-space-grotesk">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white shadow-lg rounded-2xl p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you use Indie Grid, we collect the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>GitHub Account Information:</strong> Your GitHub username, email address, profile picture, and public profile information</li>
                <li><strong>GitHub Contributions:</strong> Your public contribution data including commit history, repositories, and contribution graph data</li>
                <li><strong>Device Information:</strong> IP address and connection details of your Awtrix device for display purposes</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our service, including login times and feature usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>To provide and maintain our service</li>
                <li>To display your GitHub contributions on your Awtrix device</li>
                <li>To authenticate and authorize your access to the service</li>
                <li>To sync your contribution data in real-time</li>
                <li>To improve our service and user experience</li>
                <li>To communicate with you about service updates or issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">3. Data Storage and Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We take data security seriously and implement appropriate measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>All data is encrypted in transit using HTTPS/TLS</li>
                <li>Database connections are secured and encrypted</li>
                <li>We use secure OAuth 2.0 authentication with GitHub</li>
                <li>Access to your data is limited to necessary service operations</li>
                <li>We regularly review and update our security practices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, property, or safety, or that of our users</li>
                <li>In connection with a merger, acquisition, or sale of assets (with prior notice)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">5. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our service integrates with the following third-party services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>GitHub:</strong> For authentication and accessing your contribution data</li>
                <li><strong>Awtrix:</strong> For displaying information on your connected device</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                These services have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">6. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your information for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time. Some information may be retained for legitimate business purposes or to comply with legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">7. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw consent for data processing</li>
                <li>Export your data in a portable format</li>
                <li>Object to or restrict certain data processing activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">8. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Maintain your authentication session</li>
                <li>Remember your preferences and settings</li>
                <li>Improve our service performance and user experience</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">11. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us through our GitHub repository or via email. We will respond to your inquiries promptly.
              </p>
            </section>
          </div>
        </div>

        {/* Back to Signin */}
        <div className="text-center mt-12">
          <Link
            href="/auth/signin"
            className="group inline-flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}