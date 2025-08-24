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
  CircularProgress
} from '@mui/material';
import {
  Check,
  Star,
  Security,
  Speed,
  Analytics,
  Support,
  CreditCard,
  Lock
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import NavigationBar from '../components/NavigationBar';

// Initialize Stripe with Vite environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionPageProps {
  onBack: () => void;
  onSubscriptionSuccess: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '0.875rem',
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
      onError('Stripe is not loaded. Please refresh the page and try again.');
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Card information is required.');
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
        onError(error.message || 'Payment failed. Please check your card information and try again.');
        setLoading(false);
        return;
      }

            // Create actual Stripe subscription
      const response = await fetch('/.netlify/functions/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          email,
          name,
          priceId: 'price_1Ry4GMFRF3NKWm9LaMXes4Bf', // Pro monthly price
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const data = await response.json();
      
      if (data.status === 'active') {
        console.log('✅ Subscription created successfully:', data.subscriptionId);
        
        // CRITICAL FIX: Update local database immediately after successful payment
        const databaseService = await import('../services/databaseService');
        const db = databaseService.default.getInstance();
        
        // Get current user and update their subscription status
        const currentUser = db.getCurrentUser();
        if (currentUser) {
          console.log('🔄 Updating user subscription status to Pro...');
          const updatedUser = db.updateUserSubscription(currentUser.id, true);
          if (updatedUser) {
            // Update current user session immediately
            db.setCurrentUser({ ...updatedUser, isSubscribed: true });
            console.log('✅ User subscription updated successfully to Pro!');
            
            // Store Stripe customer info for future reference
            localStorage.setItem('stripe_customer_id', data.customerId);
            localStorage.setItem('stripe_subscription_id', data.subscriptionId);
          }
        } else {
          // Create new user if somehow they don't exist
          console.log('⚠️ No current user found, creating new Pro user...');
          const newUser = await db.createUser(email, 'stripe_temp_password', name, true);
          db.setCurrentUser(newUser);
          
          // Store Stripe info
          localStorage.setItem('stripe_customer_id', data.customerId);
          localStorage.setItem('stripe_subscription_id', data.subscriptionId);
        }
        
        onSuccess();
      } else if (data.status === 'requires_action') {
        // Handle 3D Secure or other payment confirmations
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        } else {
          console.log('✅ Payment confirmed, subscription active');
          
          // CRITICAL FIX: Also update database after payment confirmation
          const databaseService = await import('../services/databaseService');
          const db = databaseService.default.getInstance();
          
          const currentUser = db.getCurrentUser();
          if (currentUser) {
            const updatedUser = db.updateUserSubscription(currentUser.id, true);
            if (updatedUser) {
              db.setCurrentUser({ ...updatedUser, isSubscribed: true });
            }
          }
          
          onSuccess();
        }
      } else {
        throw new Error('Payment failed to complete');
      }
    } catch (err) {
      setLoading(false);
      console.error('❌ Payment processing error:', err);
      onError(err instanceof Error ? err.message : 'Network error. Please check your connection and try again.');
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
          '        Subscribe Now - $4.99/month'
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
      <NavigationBar
        showBackButton={true}
        onBackClick={onBack}
        title="Subscription Plans"
        showNavButtons={false}
      />

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
                $4.99
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                per month (billed monthly)
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
              <Security color="primary" sx={{ fontSize: 14, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Bank-Level Security
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your payment data is protected with industry-standard encryption and PCI DSS compliance.
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Speed color="primary" sx={{ fontSize: 14, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Lightning Fast
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get instant analysis results and real-time market data to make quick investment decisions.
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Analytics color="primary" sx={{ fontSize: 14, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Advanced Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access sophisticated algorithms and market insights used by professional investors.
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Support color="primary" sx={{ fontSize: 14, mb: 2 }} />
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
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Secure Payment:</strong> You'll be charged $4.99/month for unlimited access to premium features.
                Cancel anytime from your account settings.
              </Typography>
            </Alert>
            
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
