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
  Delete as DeleteIcon 
} from '@mui/icons-material';
import AdminDashboard from '../components/AdminDashboard';
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

  useEffect(() => {
    loadUsers();
  }, []);

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
      // In a real implementation, you'd call your delete API
      // await supabaseAuthService.deleteUser(userId);
      showSnackbar('User deletion feature would be implemented here', 'success');
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
        // Edit existing user
        // In a real implementation, you'd have API calls to update user data
        showSnackbar('User update feature would be implemented here', 'success');
      }
      
      setDialogOpen(false);
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('Error saving user', 'error');
    }
  };

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
                  {users.map((user) => (
                    <Paper 
                      key={user.id} 
                      sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Box>
                        <Typography variant="subtitle1">{user.email}</Typography>
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
                  ))}
                </Box>
              )}
            </Paper>
          </Container>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {/* Settings Tab */}
          <Container maxWidth="md">
            <Typography variant="h5" component="h1" gutterBottom>
              Admin Settings
            </Typography>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin settings and system configuration options will be implemented here.
              </Typography>
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
