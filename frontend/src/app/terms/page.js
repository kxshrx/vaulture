import { PageContainer } from "@/components/layout/PageContainer";

export default function TermsPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: August 4, 2025</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Vaulture, you accept and agree to be bound by
            the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            2. Use License
          </h2>
          <p>
            Permission is granted to temporarily download one copy of the
            materials on Vaulture for personal, non-commercial transitory
            viewing only.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            3. Digital Content
          </h2>
          <p>
            All digital products sold on this platform are protected by
            copyright and other intellectual property laws. Unauthorized
            distribution is prohibited.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            4. Payment Terms
          </h2>
          <p>
            All payments are processed securely through Stripe. Refunds are
            handled according to our refund policy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            5. Contact
          </h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
