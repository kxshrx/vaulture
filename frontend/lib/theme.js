"use client";
import { createTheme } from "@mui/material/styles";

// Create a minimal, working theme with Gumroad colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#FF90E8", // Gumroad's signature pink
      light: "#FFB3F0",
      dark: "#E066C7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#36D399", // Gumroad's green accent
      light: "#6EE7B7",
      dark: "#10B981",
      contrastText: "#ffffff",
    },
    background: {
      default: "#FEFEFE",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#374151",
      secondary: "#6B7280",
      disabled: "#9CA3AF",
    },
    grey: {
      50: "#F9FAFB",
      100: "#F3F4F6", 
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

// Export colors for use in components
export const colors = {
  primary: {
    main: "#FF90E8",
    light: "#FFB3F0",
    dark: "#E066C7",
  },
  secondary: {
    main: "#36D399",
    light: "#6EE7B7",
    dark: "#10B981",
  },
  background: {
    default: "#FEFEFE",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#374151",
    secondary: "#6B7280",
    disabled: "#9CA3AF",
  },
  grey: {
    50: "#F9FAFB",
    100: "#F3F4F6", 
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  gumroad: {
    pink: "#FF90E8",
    green: "#36D399",
    orange: "#FBBF24",
    blue: "#60A5FA",
    purple: "#A78BFA",
  },
};

export default theme;
