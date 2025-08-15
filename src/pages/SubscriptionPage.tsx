import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Check,
  Star,
  Security,
  Speed,
  Analytics,
  Support,
  CreditCard,
  Lock,
  ArrowBack
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface SubscriptionPageProps {
  onBack: () => void;
  onSubscriptionSuccess: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function CheckoutForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name,
          email,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      // Here you would send the paymentMethod.id to your backend
      // to create a subscription with Stripe
      
      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 2000);

    } catch (err) {
      setLoading(false);
      onError('An unexpected error occurred');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
      </Box>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard fontSize="small" />
          Card Information
        </Typography>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Paper>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={!stripe || loading}
        sx={{ mt: 2, py: 1.5 }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            Processing...
          </Box>
        ) : (
          'Subscribe Now - $0.01/month (Testing)'
        )}
      </Button>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Lock fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          Secured by Stripe. Your payment information is encrypted and secure.
        </Typography>
      </Box>
    </Box>
  );
}

export default function SubscriptionPage({ onBack, onSubscriptionSuccess }: SubscriptionPageProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const proFeatures = [
    'Unlimited property searches',
    'Advanced ROI calculations',
    'Market trend analysis',
    'Comparative market analysis (CMA)',
    'Investment recommendations',
    'Portfolio tracking',
    'Email alerts for new opportunities',
    'Priority customer support',
    'Export reports to PDF',
    'API access for developers'
  ];

  const freeFeatures = [
    'Up to 5 property searches per day',
    'Basic ROI calculations',
    'Property details view',
    'Community access'
  ];

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setPaymentDialogOpen(false);
    setTimeout(() => {
      onSubscriptionSuccess();
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Subscription Plans
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Unlock the full potential of property investment analysis
          </Typography>
        </Paper>

        {paymentSuccess && (
          <Alert severity="success" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Investimate Pro! 🎉
            </Typography>
            <Typography>
              Your subscription has been activated. You now have access to unlimited searches and premium features.
            </Typography>
          </Alert>
        )}

        {/* Pricing Cards */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
          {/* Free Plan */}
          <Card sx={{ flex: 1, position: 'relative' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                Free
              </Typography>
              <Typography variant="h2" color="primary" gutterBottom>
                $0
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Perfect for getting started
              </Typography>

              <List>
                {freeFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Check color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Button 
                variant="outlined" 
                fullWidth 
                size="large" 
                sx={{ mt: 3 }}
                onClick={onBack}
              >
                Continue with Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card sx={{ flex: 1, position: 'relative', border: 2, borderColor: 'primary.main' }}>
            <Chip 
              label="MOST POPULAR" 
              color="primary" 
              sx={{ 
                position: 'absolute', 
                top: -10, 
                left: '50%', 
                transform: 'translateX(-50%)',
                fontWeight: 'bold'
              }} 
            />
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                Pro <Star color="primary" />
              </Typography>
              <Typography variant="h2" color="primary" gutterBottom>
                $0.01
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                per month (Testing Mode)
              </Typography>

              <List>
                {proFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Check color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                sx={{ mt: 3 }}
                onClick={() => setPaymentDialogOpen(true)}
              >
                Start Pro Subscription
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Security Features */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" textAlign="center">
            Why Choose Investimate Pro?
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 3 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Security color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Bank-Level Security
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your payment data is protected with industry-standard encryption and PCI DSS compliance.
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Speed color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Lightning Fast
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get instant analysis results and real-time market data to make quick investment decisions.
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Analytics color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Advanced Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access sophisticated algorithms and market insights used by professional investors.
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Support color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Expert Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get priority support from our team of real estate and investment professionals.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Subscribe to Investimate Pro
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You'll be charged $0.01 monthly for testing purposes. This is a test subscription.
            </Typography>
            
            {paymentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {paymentError}
              </Alert>
            )}

            <Elements stripe={stripePromise}>
              <CheckoutForm 
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
