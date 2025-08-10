import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "renter"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password, role } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const user = await login(email, password, role);
      
      if (!user) {
        throw new Error("Login failed - no user data received");
      }

      // Use user.type for redirection
      const userType = user.type;
      
      if (!userType) {
        throw new Error("User type not found");
      }

      // Wait a bit for the auth state to update
      setTimeout(() => {
        switch(userType) {
          case "owner":
            navigate("/owner-dashboard", { replace: true });
            break;
          case "renter":
            navigate("/renter-dashboard", { replace: true });
            break;
          case "admin":
            navigate("/admin-dashboard", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      }, 100);

    } catch (err) {
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center">
      <Paper elevation={10} className="login-card p-4">
        <Typography variant="h4" className="text-center mb-3 fw-bold text-primary">
          RentBridge Login
        </Typography>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
            <FormControl component="fieldset" className="mb-3">
            <FormLabel component="legend">Login As</FormLabel>
            <RadioGroup 
              row 
              name="role" 
              value={role} 
              onChange={handleChange}
            >
              <FormControlLabel value="renter" control={<Radio />} label="Renter" />
              <FormControlLabel value="owner" control={<Radio />} label="Owner" />
              <FormControlLabel value="admin" control={<Radio />} label="Admin" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Email"
            type="email"
            name="email"
            fullWidth
            required
            value={email}
            onChange={handleChange}
            className="mb-3"
            margin="normal"
          />
          
          <TextField
            label="Password"
            type="password"
            name="password"
            fullWidth
            required
            value={password}
            onChange={handleChange}
            className="mb-3"
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="fw-bold"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography variant="body2" align="center" className="mt-3 text-muted">
          Don't have an account? <a href="/register">Register here</a>
        </Typography>
      </Paper>
    </div>
  );
};

export default Login;