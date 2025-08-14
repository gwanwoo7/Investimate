import { Box, Typography, Paper, Stack } from '@mui/material';

export default function ScrollTestComponent() {
  // Create an array of 20 items to test scrolling
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Property ${i + 1}`,
    price: `$${(250000 + i * 25000).toLocaleString()}`,
    address: `${123 + i} Test Street, Test City, TX 7${String(i).padStart(4, '0')}`
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Scroll Test Component
      </Typography>
      
      <Box sx={{ 
        height: '400px', 
        border: '2px solid red',
        overflow: 'auto',
        bgcolor: '#f5f5f5',
        p: 2
      }}>
        <Typography variant="h6" gutterBottom>
          Scrollable Container (400px height)
        </Typography>
        <Stack spacing={2}>
          {items.map((item) => (
            <Paper key={item.id} sx={{ p: 2 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="body1" color="primary">
                {item.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.address}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
