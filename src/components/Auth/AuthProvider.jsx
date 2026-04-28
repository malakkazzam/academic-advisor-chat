// src/components/Auth/AuthProvider.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, userAPI } from '../../services/api';
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

  // check auth
useEffect(() => {
  const checkAuth = async () => {
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

  // login
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authAPI.login({
          email,
          password,
        });

        let token = null;
        let userData = null;

        if (response.data?.token) {
          token = response.data.token;
          userData = response.data.user || response.data;
        } else if (response.data?.accessToken) {
          token = response.data.accessToken;
          userData = response.data;
        }

        if (!token) {
          toast.error('Invalid server response');
          return false;
        }

        // fallback role
        if (!userData.role) {
          if (email.includes('admin')) {
            userData.role = 'admin';
          } else if (email.includes('advisor')) {
            userData.role = 'advisor';
          } else {
            userData.role = 'student';
          }
        }

        // توحيد role
        userData.role = userData.role.toLowerCase();

        localStorage.setItem('token', token);
        localStorage.setItem(
          'user',
          JSON.stringify(userData)
        );

        setUser(userData);

        toast.success(
          `Welcome back, ${
            userData.name ||
            userData.fullName ||
            email
          }!`
        );

        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.role === 'advisor') {
          navigate('/advisor');
        } else {
          navigate('/chat');
        }

        return true;
       } catch {
       toast.error('Login failed');
      return false;
       }
    },
    [navigate]
  );

  // register
  const register = useCallback(
    async (data) => {
      try {
        const response = await authAPI.register(data);

        if (
          response.status === 200 ||
          response.status === 201
        ) {
          toast.success(
            'Registration successful! Please login.'
          );
          navigate('/login');
          return true;
        }

        toast.error('Registration failed');
        return false;
      } catch {
        toast.error('Registration failed');
        return false;
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);

    navigate('/login');

    toast.success('Logged out successfully');
  }, [navigate]);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await userAPI.updateProfile(data);

      const updatedUser = response.data;
      updatedUser.role =
        updatedUser.role?.toLowerCase();

      setUser(updatedUser);

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      );

      toast.success('Profile updated');
      return true;
    } catch {
      toast.error('Update failed');
      return false;
    }
  }, []);

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