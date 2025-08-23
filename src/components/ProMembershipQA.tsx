import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Refresh, CheckCircle, Cancel } from '@mui/icons-material';
import DatabaseService from '../services/databaseService';
import NavigationBar from './NavigationBar';

interface ProMembershipQAProps {
  onBack: () => void;
}

export default function ProMembershipQA({ onBack }: ProMembershipQAProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const db = DatabaseService.getInstance();

  const refreshData = () => {
    const user = db.getCurrentUser();
    const users = db.getAllUsers();
    
    setCurrentUser(user);
    setAllUsers(users);
    
    // Debug information
    setDebugInfo({
      currentUserFromStorage: user,
      isSubscribed: user?.isSubscribed,
      searchCount: parseInt(localStorage.getItem('investimate_search_count') || '0'),
      totalUsers: users.length,
      proUsers: users.filter(u => u.isSubscribed).length,
      freeUsers: users.filter(u => !u.isSubscribed).length
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const testMakeProMember = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, isSubscribed: true };
      db.setCurrentUser(updatedUser);
      
      // Also update in the users list
      db.updateUser(currentUser.id, { isSubscribed: true });
      
      refreshData();
    }
  };

  const testMakeFreeUser = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, isSubscribed: false };
      db.setCurrentUser(updatedUser);
      
      // Also update in the users list
      db.updateUser(currentUser.id, { isSubscribed: false });
      
      refreshData();
    }
  };

  const resetSearchCount = () => {
    localStorage.setItem('investimate_search_count', '0');
    refreshData();
  };

  const setSearchCountToMax = () => {
    localStorage.setItem('investimate_search_count', '5');
    refreshData();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavigationBar
        showBackButton={true}
        onBackClick={onBack}
        title="Pro Membership QA"
        showNavButtons={false}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Pro Membership QA Dashboard
        </Typography>

        {/* Current User Status */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current User Status
          </Typography>
          
          {currentUser ? (
            <Box>
              <Alert 
                severity={currentUser.isSubscribed ? "success" : "warning"} 
                sx={{ mb: 2 }}
                icon={currentUser.isSubscribed ? <CheckCircle /> : <Cancel />}
              >
                <strong>User:</strong> {currentUser.email} | 
                <strong> Status:</strong> {currentUser.isSubscribed ? 'PRO MEMBER' : 'FREE USER'} |
                <strong> Searches:</strong> {debugInfo.searchCount}/5
              </Alert>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={currentUser.email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Name" 
                    secondary={currentUser.name || 'Not set'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="User ID" 
                    secondary={currentUser.id} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Join Date" 
                    secondary={new Date(currentUser.joinDate).toLocaleDateString()} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Subscription Status" 
                    secondary={
                      <Typography 
                        color={currentUser.isSubscribed ? 'success.main' : 'warning.main'}
                        fontWeight="bold"
                      >
                        {currentUser.isSubscribed ? '✅ PRO MEMBER' : '⚠️ FREE USER'}
                      </Typography>
                    } 
                  />
                </ListItem>
              </List>
            </Box>
          ) : (
            <Alert severity="error">
              No user logged in. Please log in to test Pro membership functionality.
            </Alert>
          )}
        </Paper>

        {/* Test Actions */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="success"
              onClick={testMakeProMember}
              disabled={!currentUser}
            >
              Make Pro Member
            </Button>
            
            <Button 
              variant="contained" 
              color="warning"
              onClick={testMakeFreeUser}
              disabled={!currentUser}
            >
              Make Free User
            </Button>
            
            <Button 
              variant="outlined"
              onClick={resetSearchCount}
            >
              Reset Search Count (0)
            </Button>
            
            <Button 
              variant="outlined"
              color="warning"
              onClick={setSearchCountToMax}
            >
              Set Search Count to Max (5)
            </Button>
            
            <Button 
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshData}
            >
              Refresh Data
            </Button>
          </Box>
        </Paper>

        {/* Debug Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </Box>
        </Paper>

        {/* Expected Behavior */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Expected Behavior
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Free Users" 
                secondary="Should see search count (X/5 searches left) and be limited to 5 searches"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Pro Members" 
                secondary="Should NOT see search count, should see 'Pro Member' badge, unlimited searches"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Button Text" 
                secondary="Free users: 'Analyze Properties (X left)' | Pro users: 'Start Analyzing Properties'"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Navigation Bar" 
                secondary="Free users: '(X searches left)' + 'Go Pro' button | Pro users: 'Pro Member' badge"
              />
            </ListItem>
          </List>
        </Paper>

        {/* All Users Overview */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Users Overview ({allUsers.length} total)
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pro Members: {debugInfo.proUsers} | Free Users: {debugInfo.freeUsers}
          </Typography>
          
          {allUsers.map((user, index) => (
            <Box key={user.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.name} | ID: {user.id}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography 
                    variant="body2" 
                    color={user.isSubscribed ? 'success.main' : 'warning.main'}
                    fontWeight="bold"
                  >
                    {user.isSubscribed ? 'PRO' : 'FREE'}
                  </Typography>
                </Box>
              </Box>
              {index < allUsers.length - 1 && <Divider />}
            </Box>
          ))}
          
          {allUsers.length === 0 && (
            <Typography color="text.secondary">
              No users found. Create an account to test Pro membership functionality.
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
