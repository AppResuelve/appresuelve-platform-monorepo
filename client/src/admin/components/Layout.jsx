import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

export default function Layout({ token, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="fixed top-[-180px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[var(--color-primary)] blur-[120px] opacity-[0.07] pointer-events-none" />
      <div className="fixed bottom-[-180px] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-400 blur-[100px] opacity-[0.05] pointer-events-none" />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <UserMenu onLogout={onLogout} />

      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      <main className="ml-0 lg:ml-56 p-2 lg:p-6 pt-16 lg:pt-6 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
