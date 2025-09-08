import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      py: 4
    }}>
      <Box sx={{ mb: 4 }}>
        <WarningIcon color="error" sx={{ fontSize: 80 }} />
      </Box>
      
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        403 - Access Denied
      </Typography>
      
      <Typography variant="h5" sx={{ mb: 4 }}>
        You don't have permission to access this page
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        The page you're trying to access requires specific permissions. 
        Please contact your administrator if you believe this is an error.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate(-1)}
          sx={{ px: 4, py: 1.5 }}
        >
          Go Back
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ px: 4, py: 1.5 }}
        >
          Return Home
        </Button>
      </Box>
    </Container>
  );
}