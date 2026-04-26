// src/components/Auth/AuthProvider.jsx
import  { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
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

  // ✅ checkAuth defined inside useEffect to avoid dependency warnings
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

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

  const login = useCallback(async (email, password) => {
    try {
      console.log('Login attempt with:', { email, password: '***' });

      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);

      // Extract token and user data from response
      let token = null;
      let userData = null;

      if (response.data) {
        if (response.data.token && response.data.user) {
          token = response.data.token;
          userData = response.data.user;
        } else if (response.data.data?.token) {
          token = response.data.data.token;
          userData = response.data.data.user || response.data.data;
        } else if (response.data.accessToken) {
          token = response.data.accessToken;
          userData = { ...response.data };
          delete userData.accessToken;
        } else if (response.data.token) {
          token = response.data.token;
          userData = { ...response.data };
          delete userData.token;
        } else {
          token = response.data.token || response.data.accessToken;
          userData = response.data.user || response.data;
        }
      }

      console.log('Extracted token:', token ? `Yes (length: ${token.length})` : 'No');
      console.log('Extracted user data:', userData);

      if (!token) {
        console.error('No token found in response:', response.data);
        toast.error('Invalid server response');
        return false;
      }

      // Ensure role exists
      if (!userData.role) {
        if (email.includes('admin')) {
          userData.role = 'admin';
        } else if (email.includes('advisor')) {
          userData.role = 'advisor';
        } else {
          userData.role = 'student';
        }
      }

      // Save data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success(`Welcome back, ${userData.fullName || userData.name || email}!`);

      // Navigate based on role
      const role = userData.role?.toLowerCase();
      console.log('User role:', role);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'advisor') {
        navigate('/advisor');
      } else {
        navigate('/chat');
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      }

      toast.error(errorMessage);
      return false;
    }
  }, [navigate]);

  const register = useCallback(async (userData) => {
    try {
      console.log('Sending registration data to API:', userData);

      const response = await authAPI.register(userData);
      console.log('Registration response:', response);

      if (response.status === 200 || response.status === 201) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
        return true;
      }

      toast.error('Registration failed');
      return false;
    } catch (error) {
      console.error('Registration error:', error);

      const errorData = error.response?.data;
      if (errorData?.errors) {
        const errorMessages = Object.values(errorData.errors).flat();
        toast.error(errorMessages[0] || 'Registration failed');
      } else if (errorData?.title) {
        toast.error(errorData.title);
      } else {
        toast.error('Registration failed. Please check your information.');
      }
      return false;
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  const updateProfile = useCallback(async (data) => {
    try {
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed');
      return false;
    }
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;