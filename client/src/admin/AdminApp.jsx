import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './components/AlertContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Login from './pages/Login';
import Solicitudes from './pages/Solicitudes';
import ModuleBuilder from './pages/ModuleBuilder';

function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem('platform_token'));

  useEffect(() => {
    localStorage.setItem('platform_token', token || '');
  }, [token]);

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('platform_token');
    setToken(null);
  };

  return (
    <AlertProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout token={token} onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/cambios/solicitudes" element={<Solicitudes />} />
            <Route path="/cambios/constructor" element={<ModuleBuilder />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  );
}

export default AdminApp;
