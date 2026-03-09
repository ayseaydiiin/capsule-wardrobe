import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Uygulama yüklendiğinde token'ı kontrol etme - ProtectedRoute'ta yapılacak

  // Token doğrula
  const verifyToken = async (token) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Kayıt
  const register = async (username, email, password, passwordConfirm) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
        passwordConfirm,
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Kayıt başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Giriş
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Giriş başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Çıkış
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook auth provider içinde kullanılmalıdır');
  }
  return context;
};
