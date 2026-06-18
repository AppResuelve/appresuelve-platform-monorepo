import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './components/AlertContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Login from './pages/Login';
import Solicitudes from './pages/Solicitudes';
import ModuleBuilder from './pages/ModuleBuilder';

function initTheme() {
  const saved = localStorage.getItem('theme');
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (saved === 'light' || saved === 'dark') {
    root.classList.add(saved);
  } else {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(isDark ? 'dark' : 'light');
  }
}

function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem('platform_token'));

  useEffect(() => {
    initTheme();
  }, []);

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
            <Route path="/clientes" element={<Navigate to="/clientes/onboarding" replace />} />
            <Route path="/clientes/onboarding" element={<Clients view="onboarding" />} />
            <Route path="/clientes/activos" element={<Clients view="activos" />} />
            <Route path="/clientes/activos/:id" element={<ClientDetail />} />
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
