import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { 
  ArrowBack, 
  Dashboard, 
  People, 
  Settings, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock
} from '@mui/icons-material';
import AdminDashboard from '../components/AdminDashboard';
import AdminEnvironmentDebug from '../components/AdminEnvironmentDebug';
import SupabaseAuthService from '../services/supabaseAuthService';
import DatabaseService, { type User as BaseUser } from '../services/databaseService';

interface AdminUser extends BaseUser {
  created_at?: string;
  email_verified?: boolean;
  auth_method?: 'email' | 'oauth';
  subscription_status?: 'free' | 'pro';
  last_login?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface AdminPageProps {
  onBack: () => void;
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Form state for add/edit user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    emailVerified: false,
    subscriptionStatus: 'free' as 'free' | 'pro'
  });

  // Service instances
  const databaseService = DatabaseService.getInstance();
  const supabaseAuthService = SupabaseAuthService.getInstance();

  // Admin authentication - simple code-based access
  const ADMIN_CODE = 'admin2025'; // In production, this would be environment variable

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const handleAdminAuth = () => {
    if (authCode === ADMIN_CODE) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid admin code');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await databaseService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddUser = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      email: '',
      password: '',
      emailVerified: false,
      subscriptionStatus: 'free'
    });
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setDialogMode('edit');
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      emailVerified: user.email_verified || false,
      subscriptionStatus: user.subscription_status || 'free'
    });
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Remove from local database
      await databaseService.deleteUser(userId);
      showSnackbar('User deleted successfully', 'success');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Error deleting user', 'error');
    }
  };

  const handleSaveUser = async () => {
    try {
      if (dialogMode === 'add') {
        // Add new user
        const result = await supabaseAuthService.signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        if (result.user) {
          showSnackbar('User added successfully', 'success');
        } else if (result.error) {
          showSnackbar(result.error, 'error');
          return;
        }
      } else {
        // Edit existing user - update local database
        if (selectedUser) {
          await databaseService.updateUser(selectedUser.id, {
            name: formData.name,
            email: formData.email
          });
          showSnackbar('User updated successfully', 'success');
        }
      }
      
      setDialogOpen(false);
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('Error saving user', 'error');
    }
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default'
      }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <Lock sx={{ fontSize: 14, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Admin Access Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the admin code to access the administration panel
          </Typography>
          
          {authError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Admin Code"
            type="password"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={onBack} variant="outlined" fullWidth>
              Back
            </Button>
            <Button onClick={handleAdminAuth} variant="contained" fullWidth>
              Access Admin
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Admin Header */}
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
            Investimate Admin Panel
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Administrator Access
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Admin Navigation Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} centered>
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<People />} label="User Management" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={currentTab} index={0}>
          {/* Dashboard Tab */}
          <AdminDashboard />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* User Management Tab */}
          <Container maxWidth="lg">
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h1">
                User Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
                sx={{ bgcolor: 'success.main' }}
              >
                Add User
              </Button>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Registered Users
              </Typography>
              
              {loading ? (
                <Typography>Loading users...</Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {users.length === 0 ? (
                    <Typography color="text.secondary">No users found</Typography>
                  ) : (
                    users.map((user) => (
                      <Paper 
                        key={user.id} 
                        sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Box>
                          <Typography variant="subtitle1">{user.name || 'No Name'}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Email: {user.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'} | 
                            Status: {user.subscription_status || 'free'} | 
                            Verified: {user.email_verified ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton onClick={() => handleEditUser(user)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}
            </Paper>
          </Container>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {/* Settings Tab */}
          <Container maxWidth="lg">
            <Typography variant="h5" component="h1" gutterBottom>
              Admin Settings
            </Typography>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Monitor and manage system configuration, API keys, and environment settings.
              </Typography>
              
              {/* Environment Configuration Status */}
              <AdminEnvironmentDebug />
              
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>System Status:</strong> All critical services should show as "SUCCESS" for full functionality.
                    <br />
                    📋 See documentation files for detailed setup instructions if any services show errors.
                  </Typography>
                </Alert>
              </Box>
            </Paper>
          </Container>
        </TabPanel>
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            {dialogMode === 'add' && (
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.emailVerified}
                  onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                />
              }
              label="Email Verified"
            />
            <TextField
              select
              label="Subscription Status"
              value={formData.subscriptionStatus}
              onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value as 'free' | 'pro' })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {dialogMode === 'add' ? 'Add User' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
