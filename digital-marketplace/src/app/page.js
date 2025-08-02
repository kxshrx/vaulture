"use client";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { ShoppingCart, Upload, Download, Security } from "@mui/icons-material";

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <Typography variant="h1" component="h1" gutterBottom color="primary">
          Digital Marketplace
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Secure platform for creators to sell digital content with
          time-expiring download links
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            sx={{ mr: 2, mb: 2 }}
            startIcon={<ShoppingCart />}
            href="/auth/register"
          >
            Browse Products
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ mb: 2 }}
            startIcon={<Upload />}
            href="/auth/register"
          >
            Start Selling
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          mt: 4,
          justifyContent: "center",
        }}
      >
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, maxWidth: 400 }}>
          <Card className="shadow-material h-full">
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Upload color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload & Sell
              </Typography>
              <Typography color="text.secondary">
                Upload any digital content and set your price. No file type
                restrictions.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, maxWidth: 400 }}>
          <Card className="shadow-material h-full">
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Security color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Secure Downloads
              </Typography>
              <Typography color="text.secondary">
                Time-expiring download links (45 seconds) linked to user
                accounts prevent piracy.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, maxWidth: 400 }}>
          <Card className="shadow-material h-full">
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Download color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Instant Access
              </Typography>
              <Typography color="text.secondary">
                Buyers get immediate access to purchased content with secure,
                personalized download links.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 8,
          p: 4,
          backgroundColor: "background.paper",
          borderRadius: 2,
        }}
        className="shadow-material"
      >
        <Typography variant="h4" textAlign="center" gutterBottom>
          Phase 2: Authentication Complete ✅
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 2,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
            <Typography variant="body1" gutterBottom>
              ✅ Login & Registration System
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ Role-Based Authentication
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ Creator Upgrade Flow
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
            <Typography variant="body1" gutterBottom>
              ✅ Protected Routes
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ JWT Token Management
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ Navigation & User Menu
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
