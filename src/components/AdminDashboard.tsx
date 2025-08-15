import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Alert,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, People, Security, Verified, AccountBox } from '@mui/icons-material';
import DatabaseService, { type User } from '../services/databaseService';
import SupabaseAuthService from '../services/supabaseAuthService';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [supabaseUsers, setSupabaseUsers] = useState<any[]>([]);

  const db = DatabaseService.getInstance();
  const supabaseAuth = SupabaseAuthService.getInstance();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load local users
      const localUsers = db.getAllUsers();
      setUsers(localUsers);

      // Note: Supabase users would typically be accessed through admin API
      // For demo purposes, we'll show how this would work
      if (supabaseAuth.isConfigured()) {
        console.log('Supabase configured - In production, admin would access user data through admin API');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    oauth: users.filter(u => u.oauthProvider).length,
    verified: users.filter(u => !u.hashedPassword || u.oauthProvider).length,
    subscribed: users.filter(u => u.isSubscribed).length
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        👥 User Management Dashboard
      </Typography>

      {/* Security Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>🔒 Security Notice:</strong> This dashboard shows local user data for demo purposes. 
          In production with Supabase, user data is encrypted and stored securely in PostgreSQL with row-level security.
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <People color="primary" />
              <Box>
                <Typography variant="h4" color="primary">{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Users</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Security color="success" />
              <Box>
                <Typography variant="h4" color="success.main">{stats.oauth}</Typography>
                <Typography variant="body2" color="text.secondary">OAuth Users</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Verified color="info" />
              <Box>
                <Typography variant="h4" color="info.main">{stats.verified}</Typography>
                <Typography variant="body2" color="text.secondary">Verified</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountBox color="warning" />
              <Box>
                <Typography variant="h4" color="warning.main">{stats.subscribed}</Typography>
                <Typography variant="body2" color="text.secondary">Subscribed</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Auth Method</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {user.id.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {user.email}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  {user.oauthProvider ? (
                    <Chip
                      label={`${user.oauthProvider.toUpperCase()} OAuth`}
                      color="primary"
                      size="small"
                      icon={<Security />}
                    />
                  ) : (
                    <Chip
                      label="Email/Password"
                      color="default"
                      size="small"
                    />
                  )}
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user.isSubscribed && (
                      <Chip label="Subscribed" color="success" size="small" />
                    )}
                    {user.oauthProvider && (
                      <Chip label="Verified" color="info" size="small" />
                    )}
                    {user.email.includes('demo') && (
                      <Chip label="Demo" color="warning" size="small" />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
          </Typography>
        </Box>
      )}

      {/* Data Security Information */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          Data Security & Privacy
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Typography variant="subtitle2" gutterBottom>Current (Local Storage):</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Passwords are hashed using crypto.subtle.digest()<br/>
              • Data stored in browser localStorage (client-side)<br/>
              • OAuth tokens managed by Google/Apple<br/>
              • Demo environment - not production-ready
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 300px' }}>
            <Typography variant="subtitle2" gutterBottom>With Supabase (Recommended):</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Enterprise-grade PostgreSQL encryption<br/>
              • Row Level Security (RLS) policies<br/>
              • JWT tokens with automatic rotation<br/>
              • GDPR/CCPA compliant data handling<br/>
              • Email verification required<br/>
              • Admin dashboard with proper access controls
            </Typography>
          </Box>
        </Box>
        
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Important:</strong> This dashboard shows local demo data. For production use, 
            implement proper admin authentication and use Supabase's admin APIs with appropriate access controls.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
