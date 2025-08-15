import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  School, 
  TrendingUp, 
  Home, 
  Lightbulb,
  Analytics
} from '@mui/icons-material';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            About Us
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            The Story Behind Investimate
          </Typography>
        </Paper>

        {/* Main Story */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom color="primary">
                From Academia to Financial Freedom
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                For years, our founder was immersed in the world of academia — chasing research, 
                publishing papers, and mentoring students. Financial freedom was never top of mind; 
                after all, he believed he could "always make money later" and was content living 
                on a modest stipend.
              </Typography>

              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                But life has a way of shifting perspectives. When he transitioned from academia 
                back into industry, he realized that true freedom — the ability to do what you love, 
                spend more time with family, and live life on your own terms — depends on more than 
                just a salary. It requires financial independence, and for him, that meant building 
                passive income.
              </Typography>

              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                That realization sparked a bold move: purchasing his first rental property. The journey 
                wasn't easy — it involved reviewing countless listings, calculating potential returns, 
                and weighing risks. To make smarter, faster decisions, he formalized capital gain and 
                ROI calculations in a spreadsheet. Eventually, he automated the process, building a 
                web-based tool that could identify high-performing investment properties with precision.
              </Typography>

              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                That tool became <strong>Investimate</strong> — a platform designed to help everyday people, 
                from first-time investors to seasoned landlords, find rental properties with strong returns.
              </Typography>

              <Box sx={{ my: 3, p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary.dark">
                  What Investimate Does
                </Typography>
                <Typography variant="body1" sx={{ color: 'primary.dark' }}>
                  Investimate provides an intelligent, data-driven way to analyze opportunities, 
                  forecast returns, and make confident investment decisions — so you can spend 
                  less time crunching numbers and more time building the life you want.
                </Typography>
              </Box>

              <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
                Our Mission
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 500 }}>
                Empower you to achieve financial freedom through smart property investments.
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ flex: 1 }}>
            {/* Journey Timeline */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Our Journey
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Academic Beginnings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Years in research and education
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <Lightbulb />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      The Realization
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Discovering the need for financial independence
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Home />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      First Investment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purchasing the first rental property
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Analytics />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Tool Development
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Creating automated analysis tools
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Investimate Born
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sharing the platform with investors
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Core Values */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Our Values
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      Data-Driven Decisions
                    </Typography>
                    <Typography variant="body2">
                      Every recommendation backed by solid analysis
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      Accessibility
                    </Typography>
                    <Typography variant="body2">
                      Making professional analysis tools available to everyone
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      Financial Freedom
                    </Typography>
                    <Typography variant="body2">
                      Helping people build the life they want
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Call to Action */}
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center', bgcolor: 'success.light' }}>
          <Typography variant="h5" gutterBottom color="success.dark">
            Ready to Start Your Investment Journey?
          </Typography>
          <Typography variant="body1" color="success.dark">
            Join thousands of investors using Investimate to make smarter property investment decisions.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
