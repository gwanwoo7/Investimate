import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
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
            About Us
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Main Story */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ textAlign: 'center', mb: 4 }}>
            The Story Behind Investimate
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

          <Box sx={{ my: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary.dark">
              What Investimate Does
            </Typography>
            <Typography variant="body1" sx={{ color: 'primary.dark' }}>
              Investimate provides an intelligent, data-driven way to analyze opportunities, 
              forecast returns, and make confident investment decisions — so you can spend 
              less time crunching numbers and more time building the life you want.
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4, textAlign: 'center' }}>
            Our Mission
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 500, textAlign: 'center' }}>
            Empower you to achieve financial freedom through smart property investments.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
