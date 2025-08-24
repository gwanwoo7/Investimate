import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import SupabaseAuthService from '../services/supabaseAuthService';

interface EmailVerificationModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onVerificationComplete?: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  open,
  onClose,
  email,
  onVerificationComplete
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authService = SupabaseAuthService.getInstance();

  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const { error } = await authService.resendVerification(email);
      
      if (error) {
        setError(error);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (err) {
      setError('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setResendSuccess(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 2,
        position: 'relative'
      }}>
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: '50%', 
            backgroundColor: 'primary.main',
            color: 'white'
          }}>
            <EmailIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h5" component="div" fontWeight="bold">
            Verify Your Email
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', px: 3 }}>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          We've sent a verification email to:
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            color: 'primary.main',
            wordBreak: 'break-word'
          }}
        >
          {email}
        </Typography>

        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Next Steps:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            1. Check your email inbox (and spam folder)<br/>
            2. Click the verification link in the email<br/>
            3. Return to this page to continue
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {resendSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon fontSize="small" />
              Verification email sent successfully!
            </Box>
          </Alert>
        )}

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Didn't receive the email?
          </Typography>
          
          <Button
            variant="outlined"
            onClick={handleResendVerification}
            disabled={isResending}
            startIcon={
              isResending ? (
                <CircularProgress size={20} />
              ) : (
                <RefreshIcon />
              )
            }
            sx={{ minWidth: 160 }}
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Once verified, you'll be automatically signed in
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

export default EmailVerificationModal;
