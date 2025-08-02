'use client';
import { Box, Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { ShoppingCart, Upload, Download, Security } from '@mui/icons-material';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <Typography variant="h1" component="h1" gutterBottom color="primary">
          Digital Marketplace
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Secure platform for creators to sell digital content with time-expiring download links
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mr: 2, mb: 2 }}
            startIcon={<ShoppingCart />}
          >
            Browse Products
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            sx={{ mb: 2 }}
            startIcon={<Upload />}
          >
            Start Selling
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card className="shadow-material h-full">
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Upload color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload & Sell
              </Typography>
              <Typography color="text.secondary">
                Upload any digital content and set your price. No file type restrictions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="shadow-material h-full">
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Security color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Secure Downloads
              </Typography>
              <Typography color="text.secondary">
                Time-expiring download links (45 seconds) linked to user accounts prevent piracy.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="shadow-material h-full">
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Download color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Instant Access
              </Typography>
              <Typography color="text.secondary">
                Buyers get immediate access to purchased content with secure, personalized download links.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 8, p: 4, backgroundColor: 'background.paper', borderRadius: 2 }} className="shadow-material">
        <Typography variant="h4" textAlign="center" gutterBottom>
          Phase 1: Setup Complete ✅
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" gutterBottom>
              ✅ Next.js 14 with App Router
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ Material-UI v5 Theme Applied
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ Tailwind CSS Integration
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" gutterBottom>
              ✅ React Query Setup
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ Zustand Auth Store
            </Typography>
            <Typography variant="body1" gutterBottom>
              ✅ API Client Configuration
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
