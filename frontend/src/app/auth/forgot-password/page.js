"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ButtonLoading } from "@/components/ui/Loading";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // TODO: Integrate with backend API
      console.log("Reset password request for:", email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold text-black">Vaulture</span>
            </Link>
          </div>

          {/* Success Message */}
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">
                Check your email
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-semibold text-black">{email}</span>
              </p>
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="large"
                  className="w-full"
                  onClick={() => window.open("mailto:", "_blank")}
                >
                  Open Email App
                </Button>
                <Button
                  variant="ghost"
                  size="large"
                  className="w-full"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-gray-600 hover:text-black transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-black">Vaulture</span>
          </Link>
          <h2 className="text-4xl font-bold text-black mb-2">
            Forgot your password?
          </h2>
          <p className="text-gray-600 text-lg">
            No worries! Enter your email and we&apos;ll send you reset instructions.
          </p>
        </div>

        {/* Reset Form */}
        <Card className="border-gray-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium">
                  {error}
                </div>
              )}

              <Input
                name="email"
                type="email"
                label="Email address"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <ButtonLoading /> : "Send Reset Instructions"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
