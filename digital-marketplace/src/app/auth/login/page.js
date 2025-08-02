"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Divider } from "@mui/material";
import Link from "next/link";
import AuthLayout from "@/components/layouts/AuthLayout";
import LoginForm from "@/components/forms/LoginForm";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");

    try {
      console.log("Login data:", formData.email); // Debug log

      const response = await apiClient.post(
        "/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          // Bypass redirect interceptor for login
          metadata: { skipAuthRedirect: true },
        }
      );

      console.log("Login response status:", response.status); // Debug log
      console.log("Login response data:", response.data); // Debug log
      console.log("Login response headers:", response.headers); // Debug log

      // Check if the response indicates success
      if (response.status === 200 && response.data) {
        // Standard OAuth2 response structure
        if (response.data.access_token) {
          const { access_token } = response.data;

          try {
            // Decode JWT token to get user info
            const tokenParts = access_token.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("JWT payload:", payload);

              // Try to extract user info from JWT
              if (payload.sub) {
                // Create a basic user object from the JWT
                const user = {
                  id: payload.sub,
                  email: payload.email || formData.email, // Use email from form if not in JWT
                  is_creator: payload.is_creator || false,
                  display_name:
                    payload.display_name || payload.name || formData.email,
                  // Add any other fields that might be in the JWT
                  ...payload,
                };

                console.log("User object from JWT:", user);
                login(user, access_token);

                if (user.is_creator) {
                  router.push("/creator/dashboard");
                } else {
                  router.push("/dashboard");
                }
                return; // Success, exit here
              }
            }
          } catch (jwtError) {
            console.log("Failed to decode JWT:", jwtError);
          }

          // If JWT decoding fails, use the profile endpoint
          try {
            // Get user data from /profile/me endpoint (the correct endpoint from the API docs)
            const userResponse = await apiClient.get("/profile/me", {
              headers: { Authorization: `Bearer ${access_token}` },
            });

            console.log("User profile response:", userResponse.data);

            if (userResponse.data) {
              const user = userResponse.data;
              login(user, access_token);

              if (user.is_creator) {
                router.push("/creator/dashboard");
              } else {
                router.push("/dashboard");
              }
            } else {
              setError(
                "Failed to get user data after login. Please try again."
              );
            }
          } catch (userErr) {
            console.log("Error getting user data:", userErr);
            setError(
              "Login successful but failed to get user data. Please try again."
            );
          }
        } else {
          // Show the actual structure to understand what we're getting
          setError(
            `Unexpected response structure. Got: ${JSON.stringify(
              Object.keys(response.data)
            )}. Please check console for details.`
          );
          return;
        }
      } else {
        console.warn("Unexpected response status:", response.status);
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.log("Login error caught:", err); // Debug log
      console.log("Error response:", err.response); // Debug log
      console.log("Error response data:", err.response?.data); // Debug log
      console.log("Error response status:", err.response?.status); // Debug log

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
            setError("Login failed. Please check your credentials.");
          }
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          New to Digital Marketplace?
        </Typography>
      </Divider>

      <Box className="text-center">
        <Link href="/auth/register" passHref>
          <Button variant="outlined" fullWidth size="large" sx={{ py: 1.5 }}>
            Create Account
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
