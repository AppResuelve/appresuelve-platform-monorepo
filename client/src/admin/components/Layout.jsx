import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ token, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />

      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-800 shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      <main className="ml-0 lg:ml-56 p-6 pt-16 lg:pt-6 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
