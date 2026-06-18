import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';

function initTheme() {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.classList.add(isDark ? 'dark' : 'light');
}

function OnboardingApp() {
  useEffect(() => {
    initTheme();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => initTheme();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/client/:hash" element={<OnboardingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default OnboardingApp;
