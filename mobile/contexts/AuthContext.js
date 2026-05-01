import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/api';

// Create Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user when app starts
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        // Support unified token key 'userToken'
        const storedToken = await AsyncStorage.getItem('userToken');
        // If older key exists, migrate it
        if (!storedToken) {
          const legacy = await AsyncStorage.getItem('token');
          if (legacy) {
            await AsyncStorage.setItem('userToken', legacy);
            await AsyncStorage.removeItem('token');
          }
        }

        const finalToken = storedToken || (await AsyncStorage.getItem('userToken'));

        if (finalToken) {
          setToken(finalToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${finalToken}`;

          const res = await axios.get(`${API_URL}/auth/profile`);
          setUser(res.data.user);
        }
      } catch (error) {
        console.log('Failed to load user from storage', error);
        await AsyncStorage.removeItem('userToken');
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: newToken, user: newUser } = res.data;

    await AsyncStorage.setItem('userToken', newToken);
    setToken(newToken);
    setUser(newUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // Register
  const register = async (formData) => {
    const res = await axios.post(`${API_URL}/auth/register`, formData);
    const { token: newToken, user: newUser } = res.data;

    await AsyncStorage.setItem('userToken', newToken);
    setToken(newToken);
    setUser(newUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update Profile
  const updateProfile = async (newData) => {
    const res = await axios.patch(`${API_URL}/auth/profile`, newData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};