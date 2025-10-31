"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ButtonLoading } from "@/components/ui/Loading";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { AuthRedirect } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_creator: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleSelect = (is_creator) => {
    setFormData((prev) => ({
      ...prev,
      is_creator,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Remove confirmPassword and prepare data for backend
      const { confirmPassword, ...signupData } = formData;

      const result = await signup(signupData);

      if (result.success) {
        // Redirect based on user role
        if (result.user.is_creator) {
          window.location.href = "/creator/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-neon-500 rounded-md flex items-center justify-center shadow-neon-sm">
                <span className="text-dark-900 font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold text-white">Vaulture</span>
            </Link>
            <h2 className="text-4xl font-bold text-white mb-2">
              Create your account
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of creators and buyers on Vaulture
            </p>
          </div>

          {/* Signup Form */}
          <Card className="border-dark-400 bg-dark-800">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Account Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    I want to
                  </label>
                  <div className="flex space-x-3">
                    <Chip
                      active={formData.is_creator === false}
                      onClick={() => handleRoleSelect(false)}
                      variant="category"
                      size="large"
                      className="flex-1 justify-center"
                    >
                      Buy Products
                    </Chip>
                    <Chip
                      active={formData.is_creator === true}
                      onClick={() => handleRoleSelect(true)}
                      variant="category"
                      size="large"
                      className="flex-1 justify-center"
                    >
                      Sell Products
                    </Chip>
                  </div>
                </div>

                <Input
                  name="display_name"
                  type="text"
                  label="Display name"
                  placeholder="Enter your display name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  name="email"
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Create a password (min. 8 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />

                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-neon-500 focus:ring-neon-500 border-dark-400 bg-dark-500 rounded mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-3 block text-sm text-gray-300"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-neon-500 hover:text-neon-400 font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-neon-500 hover:text-neon-400 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <ButtonLoading /> : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-neon-500 hover:text-neon-400 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-400" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-900 text-gray-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="large"
              className="w-full"
              onClick={() => console.log("Google signup")}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="large"
              className="w-full"
              onClick={() => console.log("GitHub signup")}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </Button>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}
