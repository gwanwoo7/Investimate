import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { Check, CreditCard, Shield, Users } from 'lucide-react';

interface PaymentPageProps {
  onSubscribe: () => void;
  onClose: () => void;
}

export default function PaymentPage({ onSubscribe, onClose }: PaymentPageProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    
    try {
      // In production, use secure payment processors like Stripe, PayPal, or Square
      // Example: Stripe Elements with proper PCI compliance
      
      // Stripe Example (secure):
      // const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      // const { token, error } = await stripe.createToken({
      //   number: cardNumber,
      //   exp_month: expiryDate.split('/')[0],
      //   exp_year: expiryDate.split('/')[1],
      //   cvc: cvv,
      //   name: name
      // });
      
      // if (error) {
      //   setError(error.message);
      //   return;
      // }
      
      // Send token to secure backend endpoint
      // const response = await fetch('/api/process-payment', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${userToken}`,
      //     'X-CSRF-Token': csrfToken
      //   },
      //   body: JSON.stringify({
      //     token: token.id,
      //     amount: 499, // $4.99 in cents
      //     plan: 'pro-monthly'
      //   })
      // });
      
      // Simulate secure payment processing
      console.log('💳 Secure payment processing initiated');
      console.log('🔐 PCI-compliant tokenization required');
      console.log('🛡️ Server-side payment verification required');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubscribe();
    } catch (error) {
      setError('Payment processing failed. Please check your card details and try again.');
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      overflowY: 'auto',
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="md">
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Subscription Plan */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Investimate Pro
              </Typography>
              <Typography variant="h2" color="primary.main" gutterBottom>
                $4.99
                <Typography component="span" variant="h6" color="text.secondary">
                  /month
                </Typography>
              </Typography>
              
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Check color="#4caf50" size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited property searches" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Check color="#4caf50" size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Advanced market analytics" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Check color="#4caf50" size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Real-time property alerts" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Check color="#4caf50" size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Premium community features" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Check color="#4caf50" size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Investment portfolio tracking" />
                </ListItem>
              </List>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Shield size={16} color="#4caf50" />
                <Typography variant="body2" color="text.secondary">
                  30-day money-back guarantee
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Users size={20} color="#1976d2" />
                <Typography variant="h6">
                  Join 2,847+ Pro Investors
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                "Investimate Pro has helped me identify 12 profitable properties in the last 6 months. The unlimited searches are a game-changer!"
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                - Sarah Chen, Real Estate Investor
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Payment Form */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CreditCard size={24} />
                <Typography variant="h5">
                  Payment Details
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                  disabled={processing}
                />
                
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                  disabled={processing}
                />
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="MM/YY"
                    placeholder="12/25"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    sx={{ flex: 1 }}
                    required
                    disabled={processing}
                  />
                  <TextField
                    label="CVV"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    sx={{ flex: 1 }}
                    required
                    disabled={processing}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Investimate Pro (Monthly)</Typography>
                    <Typography>$4.99</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary.main">$4.99</Typography>
                  </Box>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mb: 2 }}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={20} color="inherit" /> : undefined}
                >
                  {processing ? 'Processing...' : 'Subscribe Now'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onClose}
                  disabled={processing}
                >
                  Cancel
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                  You can cancel anytime from your account settings.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      </Container>
    </Box>
  );
}
