"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuthStore } from "@/store/authStore";

export default function UpgradePage() {
  const [formData, setFormData] = useState({
    bio: "",
    social_links: {
      website: "",
      twitter: "",
      instagram: "",
    },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();
  const { upgradeToCreator, user } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("social_")) {
      const socialField = name.replace("social_", "");
      setFormData({
        ...formData,
        social_links: {
          ...formData.social_links,
          [socialField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = "Bio must be less than 500 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await upgradeToCreator(formData);
      router.push("/creator/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Upgrade failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (user?.is_creator) {
    router.push("/creator/dashboard");
    return null;
  }

  return (
    <AuthLayout
      title="Upgrade to Creator"
      subtitle="Start selling your digital content today"
    >
      <Card className="mb-6 bg-blue-50 border border-blue-200">
        <CardContent className="text-center p-6">
          <Upload color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="primary" gutterBottom>
            Become a Creator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload and sell your digital content with secure, time-limited
            download links. Track your earnings and analytics in your creator
            dashboard.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} className="space-y-4">
        <TextField
          fullWidth
          name="bio"
          label="Bio"
          multiline
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          error={!!validationErrors.bio}
          helperText={
            validationErrors.bio || `${formData.bio.length}/500 characters`
          }
          disabled={loading}
          placeholder="Tell buyers about yourself and the type of content you create..."
        />

        <Typography variant="h6" className="pt-4 pb-2">
          Social Links (Optional)
        </Typography>

        <TextField
          fullWidth
          name="social_website"
          label="Website"
          value={formData.social_links.website}
          onChange={handleChange}
          disabled={loading}
          placeholder="https://yourwebsite.com"
        />

        <TextField
          fullWidth
          name="social_twitter"
          label="Twitter"
          value={formData.social_links.twitter}
          onChange={handleChange}
          disabled={loading}
          placeholder="@yourusername"
        />

        <TextField
          fullWidth
          name="social_instagram"
          label="Instagram"
          value={formData.social_links.instagram}
          onChange={handleChange}
          disabled={loading}
          placeholder="@yourusername"
        />

        <Box className="flex gap-4 pt-4">
          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.push("/dashboard")}
            disabled={loading}
          >
            Maybe Later
          </Button>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Upgrading..." : "Upgrade to Creator"}
          </Button>
        </Box>
      </Box>
    </AuthLayout>
  );
}
