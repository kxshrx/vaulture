import { PageContainer } from "@/components/layout/PageContainer";

export default function PrivacyPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: August 4, 2025</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, make a purchase, or contact us.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, process transactions, and communicate with you.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            3. Information Sharing
          </h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties without your consent, except as
            described in this policy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            4. Data Security
          </h2>
          <p>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            5. Cookies
          </h2>
          <p>
            We use cookies to enhance your experience on our platform and to
            analyze usage patterns.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            6. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
