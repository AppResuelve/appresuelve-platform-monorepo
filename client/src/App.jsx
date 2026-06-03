import React, { Suspense, lazy } from 'react';

const AdminApp = lazy(() => import('./admin/AdminApp'));
const OnboardingApp = lazy(() => import('./onboarding/OnboardingApp'));

function App() {
  const hostname = window.location.hostname;
  const params = new URLSearchParams(window.location.search);
  const isAdmin = hostname.startsWith('admin.') || params.get('app') === 'admin';

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Cargando...</div>
      </div>
    }>
      {isAdmin ? <AdminApp /> : <OnboardingApp />}
    </Suspense>
  );
}

export default App;
