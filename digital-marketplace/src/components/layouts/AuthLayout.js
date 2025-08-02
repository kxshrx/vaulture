"use client";
import { Container, Box, Typography, Paper } from "@mui/material";
import Link from "next/link";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <Box className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Container maxWidth="sm">
        <Box className="text-center mb-8">
          <Link href="/" className="no-underline">
            <Typography variant="h4" color="primary" className="font-bold mb-2">
              Digital Marketplace
            </Typography>
          </Link>
          <Typography variant="h5" className="text-gray-700 mb-2">
            {title}
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            {subtitle}
          </Typography>
        </Box>

        <Paper elevation={3} className="p-8 rounded-lg shadow-material">
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
