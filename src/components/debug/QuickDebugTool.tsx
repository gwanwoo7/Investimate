import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Alert } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const QuickDebugTool: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setError(null);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setError(`Auth error: ${authError.message}`);
        return;
      }

      if (!user) {
        setError('No authenticated user found');
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(`Profile error: ${profileError.message}`);
        return;
      }

      setUserData({
        auth: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: profile
      });

    } catch (err) {
      setError(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', m: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔍 Quick Database Debug Tool
        </Typography>

        <Button variant="contained" onClick={fetchUserData} sx={{ mb: 2 }}>
          Refresh Data
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {userData && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Check these values in your database:</strong>
              <br />
              • subscription_status should be 'active' or 'pro' for pro users
              <br />
              • subscription_tier should be 'pro' for pro users
              <br />
              • subscription_ends_at should be null or future date
            </Alert>

            <Typography variant="h6" color="primary" gutterBottom>
              🔑 Auth Data:
            </Typography>
            <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2, overflow: 'auto' }}>
              {JSON.stringify(userData.auth, null, 2)}
            </Box>

            <Typography variant="h6" color="primary" gutterBottom>
              👤 Profile Data:
            </Typography>
            <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, overflow: 'auto' }}>
              {JSON.stringify(userData.profile, null, 2)}
            </Box>

            <Alert 
              severity={
                userData.profile?.subscription_status === 'active' || 
                userData.profile?.subscription_status === 'pro' ||
                userData.profile?.subscription_tier === 'pro' 
                  ? 'success' : 'warning'
              } 
              sx={{ mt: 2 }}
            >
              <strong>Subscription Analysis:</strong>
              <br />
              Status: {userData.profile?.subscription_status || 'Not set'}
              <br />
              Tier: {userData.profile?.subscription_tier || 'Not set'}
              <br />
              Ends At: {userData.profile?.subscription_ends_at || 'Not set'}
              <br />
              <strong>Expected for Pro:</strong> status='active' OR status='pro', tier='pro'
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickDebugTool;
