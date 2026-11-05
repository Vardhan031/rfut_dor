import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('rfut_admin_token') || null);
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('rfut_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const loginAdmin = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      if (res.data?.success) {
        localStorage.setItem('rfut_admin_token', res.data.token);
        localStorage.setItem('rfut_admin_user', JSON.stringify(res.data.admin));
        setToken(res.data.token);
        setAdmin(res.data.admin);
        toast.success(`Admin logged in as ${res.data.admin.username}`);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid admin credentials.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('rfut_admin_token');
    localStorage.removeItem('rfut_admin_user');
    setToken(null);
    setAdmin(null);
    toast.info('Admin session logged out.');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        loading,
        loginAdmin,
        logoutAdmin,
        isAuthenticated: Boolean(token)
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
