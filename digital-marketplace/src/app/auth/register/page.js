"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Divider } from "@mui/material";
import Link from "next/link";
import AuthLayout from "@/components/layouts/AuthLayout";
import RegisterForm from "@/components/forms/RegisterForm";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (formData, role) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint =
        role === "creator" ? "/auth/register/creator" : "/auth/register/buyer";
      const response = await apiClient.post(endpoint, formData);

      console.log("Registration response:", response.data); // Debug log

      // Check if response has the expected structure with token and user
      if (response.data && response.data.access_token && response.data.user) {
        const { access_token, user } = response.data;
        login(user, access_token);

        if (user.is_creator) {
          router.push("/creator/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else if (response.data && response.data.id && response.data.email) {
        // Registration endpoint returns user object directly (without token)
        // This is successful registration, redirect to login
        console.log("Registration successful, user created:", response.data);
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        // Success but unexpected response structure
        console.warn("Unexpected response structure:", response.data);
        setError(
          "Registration completed but there was an issue with sign-in. Please try logging in manually."
        );
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          setError(err.response.data.detail);
        } else if (Array.isArray(err.response.data.detail)) {
          const firstError = err.response.data.detail[0];
          if (typeof firstError === "string") {
            setError(firstError);
          } else if (
            firstError &&
            typeof firstError === "object" &&
            firstError.msg
          ) {
            setError(firstError.msg);
          } else {
            setError("Registration failed. Please check your information.");
          }
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of creators and buyers"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
      />

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?
        </Typography>
      </Divider>

      <Box className="text-center">
        <Link href="/auth/login" passHref>
          <Button variant="outlined" fullWidth size="large" sx={{ py: 1.5 }}>
            Sign In
          </Button>
        </Link>
      </Box>

      <Box className="text-center mt-4">
        <Link href="/" passHref>
          <Button variant="text" color="primary">
            Back to Home
          </Button>
        </Link>
      </Box>
    </AuthLayout>
  );
}
