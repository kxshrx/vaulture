"use client";
import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from "@mui/icons-material";
import RoleSelector from "./RoleSelector";

export default function RegisterForm({ onSubmit, loading, error, success }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
    display_name: "",
    bio: "",
    social_links: {
      website: "",
      twitter: "",
      instagram: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const steps = ["Select Role", "Account Details", "Profile Setup"];

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

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!formData.role) {
        errors.role = "Please select an account type";
      }
    }

    if (step === 1) {
      if (!formData.email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password =
          "Password must contain uppercase, lowercase, and number";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      if (!formData.display_name) {
        errors.display_name = "Display name is required";
      } else if (
        formData.display_name.length < 2 ||
        formData.display_name.length > 50
      ) {
        errors.display_name = "Display name must be 2-50 characters";
      } else if (!/^[a-zA-Z\s]+$/.test(formData.display_name)) {
        errors.display_name =
          "Display name can only contain letters and spaces";
      }
    }

    if (step === 2 && formData.role === "creator") {
      if (formData.bio && formData.bio.length > 500) {
        errors.bio = "Bio must be less than 500 characters";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(activeStep)) {
      const submitData = {
        email: formData.email,
        password: formData.password,
        display_name: formData.display_name,
        ...(formData.role === "creator" && {
          bio: formData.bio,
          social_links: formData.social_links,
        }),
      };
      onSubmit(submitData, formData.role);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <RoleSelector value={formData.role} onChange={handleRoleChange} />
            {validationErrors.role && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {validationErrors.role}
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box className="space-y-4">
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="display_name"
              label="Display Name"
              value={formData.display_name}
              onChange={handleChange}
              error={!!validationErrors.display_name}
              helperText={validationErrors.display_name}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 2:
        if (formData.role === "creator") {
          return (
            <Box className="space-y-4">
              <Typography variant="h6" gutterBottom>
                Creator Profile Setup
              </Typography>

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
                  validationErrors.bio ||
                  `${formData.bio.length}/500 characters`
                }
                disabled={loading}
                placeholder="Tell buyers about yourself and your content..."
              />

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
            </Box>
          );
        } else {
          return (
            <Box className="text-center py-8">
              <Typography variant="h6" gutterBottom>
                Ready to Get Started!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your buyer account will be created and you can start exploring
                the marketplace.
              </Typography>
            </Box>
          );
        }

      default:
        return null;
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" className="mb-4">
          {typeof error === "string"
            ? error
            : error?.message || "An error occurred"}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4">
          {success}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box component="form" onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}

        <Box className="flex justify-between mt-6">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
