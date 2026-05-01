// src/components/Auth/AuthProvider.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as apiLogin, register as apiRegister } from '../../services/api';
import AuthContext from '../../context/AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Check auth
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Checking auth - token exists:', !!token);
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (isMounted.current && parsedUser) {
            setUser(parsedUser);
          }
        } catch (err) {
          console.error('Error parsing stored user:', err);
          if (isMounted.current) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      if (isMounted.current) {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    console.log("🚀 Login function STARTED with:", email);
    
    try {
      console.log("🚀 Calling API...");
      const response = await apiLogin(email, password);
      
      console.log("🚀 Response:", response.data);
      
      const { token, id, fullName, email: userEmail, role } = response.data;
      
      if (token) {
        console.log("🚀 Saving token to localStorage");
        localStorage.setItem('token', token);
        
        const userData = {
          id,
          email: userEmail || email,
          fullName: fullName || email.split('@')[0],
          role: role?.toLowerCase() || 'student'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        console.log("🚀 Token saved successfully!");
        toast.success(`Welcome back, ${userData.fullName}!`);
        
        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.role === 'advisor') {
          navigate('/advisor');
        } else {
          navigate('/chat');
        }
        
        return true;
      } else {
        console.log("🚀 No token in response!");
        toast.error('Login failed - no token received');
        return false;
      }
    } catch (err) {
      console.error("🚀 Login ERROR:", err);
      console.error("🚀 Error response:", err.response?.data);
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  }, [navigate]);

  // Register
  const register = useCallback(async (data) => {
    try {
      const response = await apiRegister(data);
      if (response.status === 200 || response.status === 201) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
        return true;
      }
      toast.error('Registration failed');
      return false;
    } catch (err) {
      console.error('Register error:', err);
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    }
  }, [navigate]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};