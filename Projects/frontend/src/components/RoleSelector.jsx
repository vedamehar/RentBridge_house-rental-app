import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Grid } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <Typography variant="h4" gutterBottom>Choose Your Role</Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item>
          <Button variant="contained" color="primary" onClick={() => navigate('/owner')}>Owner</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" onClick={() => navigate('/tenant')}>Tenant</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success" onClick={() => navigate('/admin')}>Admin</Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RoleSelector;
