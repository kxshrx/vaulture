"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Check, ArrowRight, Star } from "lucide-react";

export default function UpgradePage() {
  const { user, logout, upgradeToCreator } = useAuth();

  const handleUpgrade = async () => {
    try {
      const result = await upgradeToCreator();

      if (result.success) {
        alert(
          "Creator account activated successfully. Redirecting to your secure Creator Dashboard..."
        );

        // Redirect to creator dashboard
        setTimeout(() => {
          window.location.href = "/creator/dashboard";
        }, 1000);
      } else {
        alert(
          result.error || "Account upgrade failed. Please contact support."
        );
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert("Account upgrade failed. Please contact support.");
    }
  };

  return (
    <ProtectedRoute requireAuth={true} requiredRole="buyer">
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="border-b border-dark-400 backdrop-custom">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-neon-500 rounded-md flex items-center justify-center shadow-neon-sm">
                  <span className="text-dark-900 font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-white">Vaulture</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-neon-500/10 text-neon-500 border border-neon-500/30 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              <span>Upgrade Your Account</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Upgrade to Creator Account
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators who trust our enterprise-grade security
              to protect their digital products and maximize revenue
            </p>
          </div>

          {/* Upgrade Card */}
          <Card className="border-2 border-neon-500/30 shadow-neon bg-dark-800">
            <CardHeader className="text-center p-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Professional Creator Tools
              </h2>
              <p className="text-gray-400 text-lg">
                Enterprise-grade platform for digital product sales
              </p>
            </CardHeader>
            <CardContent className="p-8">
              {/* Features */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Unlimited secure product uploads
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Real-time performance analytics
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Advanced DRM & piracy protection
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Secure time-limited access links
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Automated payment processing
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Customer management tools
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Professional marketing suite
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-neon-500/10 rounded-full flex items-center justify-center border border-neon-500/30">
                      <Check className="w-4 h-4 text-neon-500" />
                    </div>
                    <span className="text-gray-300">
                      Dedicated customer support
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center bg-dark-700 rounded-lg p-6 mb-8 border border-dark-400">
                <div className="text-4xl font-bold text-white mb-2">
                  Free to Start
                </div>
                <div className="text-gray-400 mb-4">
                  Industry-low 5% commission on sales
                </div>
                <div className="text-sm text-gray-500">
                  No setup fees • No monthly charges • Cancel anytime
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleUpgrade}
                  className="w-full md:w-auto text-lg px-12 py-4"
                >
                  Activate Creator Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Instant activation • Full platform access • Secure payment
                  processing
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial */}
          <div className="text-center mt-16 bg-dark-800 border border-dark-400 rounded-2xl p-8">
            <blockquote className="text-xl text-gray-300 italic mb-4">
              &ldquo;Vaulture&apos;s security features completely eliminated
              piracy concerns for my digital courses. The professional analytics
              and payment processing helped me scale to six figures.&rdquo;
            </blockquote>
            <div className="font-semibold text-white">Dr. Sarah Chen</div>
            <div className="text-gray-400">
              Course Creator • $180k+ in protected sales
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
