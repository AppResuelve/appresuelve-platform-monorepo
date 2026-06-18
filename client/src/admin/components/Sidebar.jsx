import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, X, Wrench, ChevronDown, ChevronRight, FileText, Puzzle, Clock } from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const [clientesExpanded, setClientesExpanded] = useState(false)
  const [cambiosExpanded, setCambiosExpanded] = useState(false)

  useEffect(() => {
    if (location.pathname.startsWith('/clientes')) {
      setClientesExpanded(true)
    }
    if (location.pathname.startsWith('/cambios')) {
      setCambiosExpanded(true)
    }
  }, [location.pathname])

  const clientItems = [
    { to: '/clientes/onboarding', icon: Clock, label: 'Onboarding' },
    { to: '/clientes/activos', icon: Users, label: 'Activos' },
  ]

  const cambioItems = [
    { to: '/cambios/solicitudes', icon: FileText, label: 'Solicitudes' },
    { to: '/cambios/constructor', icon: Puzzle, label: 'Constructor' },
  ]

  const isClientesActive = location.pathname.startsWith('/clientes')
  const isCambiosActive = location.pathname.startsWith('/cambios')

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-3">
          <img src="https://res.cloudinary.com/dfun5vbsf/image/upload/v1779926864/logo_s-f_appresuleve_250px_ccbmqf.png" alt="AppResuelve" className="h-8 w-auto" />
          <span className="font-semibold text-[var(--color-text-primary)] text-sm">AppResuelve <span className="text-[var(--color-text-muted)] font-normal">Admin</span></span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <NavLink
          to="/"
          end
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-950 text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>

        {/* Clientes collapsible */}
        <div>
          <button
            onClick={() => setClientesExpanded(!clientesExpanded)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
              isClientesActive
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="flex-1 text-left">Clientes</span>
            {clientesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {clientesExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-[var(--color-border)] pl-2">
              {clientItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Cambios de clientes collapsible */}
        <div>
          <button
            onClick={() => setCambiosExpanded(!cambiosExpanded)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
              isCambiosActive
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span className="flex-1 text-left">Cambios de clientes</span>
            {cambiosExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {cambiosExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-[var(--color-border)] pl-2">
              {cambioItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] px-4 py-3 shrink-0">
        <p className="text-xs text-[var(--color-text-muted)] text-center">Panel Administración v1.0</p>
      </div>
    </>
  )

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full w-56 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] flex flex-col z-50
          transition-transform duration-300
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {content}
      </aside>
    </>
  );
}
