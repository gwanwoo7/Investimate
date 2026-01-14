import { Box, Container, Typography, Button, Grid, Card, CardContent, Chip, Paper, Stack, Avatar } from '@mui/material';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Shield, 
  CheckCircle2, 
  Star,
  BarChart3,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';

interface EnhancedLandingPageProps {
  user: { email: string; isSubscribed: boolean; name?: string; id?: string } | null;
  canSearch: boolean;
  searchesRemaining: number;
  onStartAnalyzing: () => void;
  onUpgrade: () => void;
  onShowCommunity: () => void;
}

export default function EnhancedLandingPage({
  user,
  canSearch,
  searchesRemaining,
  onStartAnalyzing,
  onUpgrade,
  onShowCommunity
}: EnhancedLandingPageProps) {
  
  const features = [
    {
      icon: <Calculator size={48} />,
      title: 'Instant Property Analysis',
      description: 'Get detailed cash flow, ROI, and cap rate calculations in seconds. Make data-driven investment decisions with confidence.',
      color: '#1976d2'
    },
    {
      icon: <MapPin size={48} />,
      title: 'Smart Map Search',
      description: 'Draw custom boundaries on the map to search multiple properties simultaneously. Find hidden gems in your target markets.',
      color: '#2e7d32'
    },
    {
      icon: <BarChart3 size={48} />,
      title: 'Investment Scoring',
      description: 'Each property gets an investment score (1-10) based on multiple factors. Quickly identify the best opportunities.',
      color: '#ed6c02'
    },
    {
      icon: <TrendingUp size={48} />,
      title: 'Real Market Data',
      description: 'Powered by Zillow and real estate APIs for accurate property values, rental estimates, and market trends.',
      color: '#9c27b0'
    },
    {
      icon: <Users size={48} />,
      title: 'Investor Community',
      description: 'Connect with fellow real estate investors, share deals, and learn from experienced professionals.',
      color: '#0288d1'
    },
    {
      icon: <Shield size={48} />,
      title: 'Secure & Private',
      description: 'Bank-level security with Stripe payments. Your data is encrypted and never shared with third parties.',
      color: '#d32f2f'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Properties Analyzed' },
    { value: '1,500+', label: 'Happy Investors' },
    { value: '$50M+', label: 'Deals Found' },
    { value: '4.9/5', label: 'User Rating' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'First-Time Investor',
      avatar: '👩‍💼',
      text: 'Investimate helped me find my first rental property with a 12% CoC return. The analysis tools gave me confidence to make the purchase.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Portfolio Investor',
      avatar: '👨‍💻',
      text: 'I analyze 20+ properties a week with Investimate. The Pro plan pays for itself with just one good deal. Highly recommended!',
      rating: 5
    },
    {
      name: 'Jennifer Thompson',
      role: 'Real Estate Agent',
      avatar: '👩‍💼',
      text: 'My clients love the detailed reports. It helps them understand the investment potential before making offers.',
      rating: 5
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 14 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
            {/* Trust Badges */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Chip 
                icon={<Shield size={16} />} 
                label="Secure & Encrypted" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '& .MuiChip-icon': { color: 'white' }
                }} 
                variant="outlined"
              />
              <Chip 
                icon={<CheckCircle2 size={16} />} 
                label="Verified Data" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '& .MuiChip-icon': { color: 'white' }
                }} 
                variant="outlined"
              />
              <Chip 
                icon={<Star size={16} />} 
                label="4.9/5 Rating" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '& .MuiChip-icon': { color: 'white' }
                }} 
                variant="outlined"
              />
            </Stack>

            <Typography variant="h1" component="h1" gutterBottom sx={{ 
              mb: 3,
              fontWeight: 800,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              Find Your Next Cash-Flowing Property in Minutes
            </Typography>
            
            <Typography variant="h5" sx={{ 
              mb: 4,
              opacity: 0.95,
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              lineHeight: 1.6
            }}>
              Data-driven analysis + Real-time market data = Smarter investments
            </Typography>
            
            <Typography variant="body1" sx={{ 
              mb: 5,
              opacity: 0.9,
              fontSize: { xs: '1rem', md: '1.1rem' },
              maxWidth: '700px',
              mx: 'auto'
            }}>
              Stop spreadsheet guessing. Start analyzing properties with institutional-grade tools 
              used by professional investors. Free to start, upgrade anytime.
            </Typography>

            {/* Search Limit Warning for Free Users */}
            {user && !user.isSubscribed && !canSearch && (
              <Paper sx={{ 
                mb: 4, 
                p: 3, 
                bgcolor: 'rgba(255, 193, 7, 0.95)', 
                borderRadius: 3,
                boxShadow: 4
              }}>
                <Typography variant="h6" sx={{ mb: 1, color: '#000', fontWeight: 'bold' }}>
                  🎯 Daily Search Limit Reached
                </Typography>
                <Typography sx={{ mb: 2, color: '#000' }}>
                  You've used all {5 - searchesRemaining} of your free searches today. Upgrade to Pro for unlimited access!
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={onUpgrade}
                  size="large"
                  sx={{ 
                    bgcolor: '#000', 
                    color: '#ffc107', 
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#333' } 
                  }}
                >
                  Unlock Unlimited Searches - $4.99/month
                </Button>
              </Paper>
            )}

            {/* CTA Buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Button 
                variant="contained" 
                size="large" 
                onClick={onStartAnalyzing}
                startIcon={<Calculator />}
                sx={{ 
                  py: 2, 
                  px: 5, 
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: 6,
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 8
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {user ? (
                  user.isSubscribed ? 'Start Analyzing Now' : `Start Free (${searchesRemaining} searches left)`
                ) : (
                  'Start Free Analysis'
                )}
              </Button>
              
              {!user?.isSubscribed && (
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={onUpgrade}
                  startIcon={<Star />}
                  sx={{ 
                    py: 2, 
                    px: 5, 
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    borderWidth: 2,
                    '&:hover': { 
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderWidth: 2
                    }
                  }}
                >
                  Upgrade to Pro
                </Button>
              )}
            </Stack>

            {/* Value Props */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              sx={{ opacity: 0.9 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle2 size={20} />
                <Typography variant="body2">No credit card required</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Clock size={20} />
                <Typography variant="body2">5 free searches daily</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <DollarSign size={20} />
                <Typography variant="body2">Pro: $4.99/month</Typography>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 4, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" gutterBottom sx={{ mb: 2, fontWeight: 700 }}>
            Everything You Need to Invest Confidently
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: '700px', mx: 'auto' }}>
            Professional-grade tools that help you analyze properties faster and make better investment decisions
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: 8
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      color: feature.color,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: `${feature.color}15`,
                      mx: 'auto'
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" textAlign="center" lineHeight={1.7}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" gutterBottom sx={{ mb: 2, fontWeight: 700 }}>
            Trusted by Smart Investors
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8 }}>
            See what real investors are saying about Investimate
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent sx={{ p: 4 }}>
                    {/* Rating Stars */}
                    <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={20} fill="#ffc107" color="#ffc107" />
                      ))}
                    </Stack>
                    
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Ready to Find Your Next Investment?
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.95 }}>
            Join thousands of investors using Investimate to build their real estate portfolio
          </Typography>
          
          <Button 
            variant="contained" 
            size="large" 
            onClick={onStartAnalyzing}
            startIcon={<Calculator />}
            sx={{ 
              py: 2.5, 
              px: 6, 
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '1.2rem',
              boxShadow: 6,
              '&:hover': { 
                bgcolor: 'grey.100',
                transform: 'scale(1.05)',
                boxShadow: 10
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Start Your Free Analysis Now
          </Button>
          
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            No credit card required • 5 free searches daily • Upgrade anytime
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
