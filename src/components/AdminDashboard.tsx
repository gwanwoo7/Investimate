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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Search, 
  People, 
  Security, 
  Verified, 
  AccountBox,
  Edit,
  Delete,
  Add,
  Email,
  Phone,
  Block,
  CheckCircle
} from '@mui/icons-material';
import DatabaseService, { type User } from '../services/databaseService';
import SupabaseAuthService from '../services/supabaseAuthService';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [supabaseUsers, setSupabaseUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'free' | 'pro'>('all');

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMembership = membershipFilter === 'all' || 
      (membershipFilter === 'pro' && user.isSubscribed) ||
      (membershipFilter === 'free' && !user.isSubscribed);
    return matchesSearch && matchesMembership;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Update user in database
      await db.updateUser(selectedUser.id, selectedUser);
      await loadUserData();
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await db.deleteUser(selectedUser.id);
      await loadUserData();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleSubscription = async (user: User) => {
    try {
      const updatedUser = { ...user, isSubscribed: !user.isSubscribed };
      await db.updateUser(user.id, updatedUser);
      await loadUserData();
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

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

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Membership</InputLabel>
          <Select
            value={membershipFilter}
            label="Membership"
            onChange={(e) => setMembershipFilter(e.target.value as 'all' | 'free' | 'pro')}
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="free">Free Users</MenuItem>
            <MenuItem value="pro">Pro Users</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
              <TableCell>Actions</TableCell>
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
                    <Chip 
                      label={user.isSubscribed ? 'Pro' : 'Free'} 
                      color={user.isSubscribed ? 'success' : 'default'} 
                      size="small"
                      onClick={() => handleToggleSubscription(user)}
                      clickable
                    />
                    {user.oauthProvider && (
                      <Chip label="Verified" color="info" size="small" />
                    )}
                    {user.email.includes('demo') && (
                      <Chip label="Demo" color="warning" size="small" />
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit User">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.isSubscribed ? 'Revoke Pro' : 'Grant Pro'}>
                      <IconButton 
                        size="small" 
                        color="success" 
                        onClick={() => handleToggleSubscription(user)}
                      >
                        {user.isSubscribed ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </Tooltip>
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
            <strong>Important:</strong> This dashboard shows local user data for demo purposes. 
            In production with Supabase, user data is encrypted and stored securely in PostgreSQL with row-level security.
          </Typography>
        </Alert>
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Full Name"
              value={selectedUser?.name || ''}
              onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, name: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={selectedUser?.email || ''}
              onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, email: e.target.value } : null)}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedUser?.isSubscribed || false}
                  onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, isSubscribed: e.target.checked } : null)}
                />
              }
              label="Pro Membership"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.name}" ({selectedUser?.email})? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
