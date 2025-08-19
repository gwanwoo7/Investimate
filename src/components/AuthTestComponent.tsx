import { useState } from 'react';
import { Box, Button, Typography, Alert, TextField } from '@mui/material';
import DatabaseService from '../services/databaseService';

export default function AuthTestComponent() {
  const [result, setResult] = useState<string>('');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');

  const db = DatabaseService.getInstance();

  const testSignup = async () => {
    try {
      setResult('Testing signup...');
      const user = await db.createUser(email, password, name);
      setResult(`✅ Signup successful: ${JSON.stringify(user, null, 2)}`);
    } catch (error) {
      setResult(`❌ Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testLogin = async () => {
    try {
      setResult('Testing login...');
      const user = await db.authenticateUser(email, password);
      setResult(`✅ Login successful: ${JSON.stringify(user, null, 2)}`);
    } catch (error) {
      setResult(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearUsers = () => {
    localStorage.removeItem('rental_app_users');
    setResult('✅ All users cleared from localStorage');
  };

  const listUsers = () => {
    const users = db.getUsers();
    setResult(`📋 Current users: ${JSON.stringify(users, null, 2)}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Authentication Test Component
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{ mb: 1 }}
        />
        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{ mb: 1 }}
        />
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Button variant="contained" onClick={testSignup}>
          Test Signup
        </Button>
        <Button variant="outlined" onClick={testLogin}>
          Test Login
        </Button>
        <Button variant="outlined" onClick={listUsers}>
          List Users
        </Button>
        <Button variant="outlined" color="error" onClick={clearUsers}>
          Clear Users
        </Button>
      </Box>

      {result && (
        <Alert severity={result.includes('✅') ? 'success' : result.includes('❌') ? 'error' : 'info'}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result}
          </pre>
        </Alert>
      )}
    </Box>
  );
}
