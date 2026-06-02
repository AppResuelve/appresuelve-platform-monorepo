import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';

function OnboardingApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/client/:hash" element={<OnboardingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default OnboardingApp;
