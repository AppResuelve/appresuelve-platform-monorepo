import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, X, Wrench, ChevronDown, ChevronRight, FileText, Puzzle } from 'lucide-react';

export default function Sidebar({ open, onClose, onLogout }) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (location.pathname.startsWith('/cambios')) {
      setExpanded(true)
    }
  }, [location.pathname])

  const items = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/clientes', icon: Users, label: 'Clientes', end: false },
  ]

  const subItems = [
    { to: '/cambios/solicitudes', icon: FileText, label: 'Solicitudes' },
    { to: '/cambios/constructor', icon: Puzzle, label: 'Constructor' },
  ]

  const isParentActive = location.pathname.startsWith('/cambios')

  const content = (
    <>
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-slate-800 text-sm">AppResuelve</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {/* Collapsible "Cambios de clientes" */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
              isParentActive
                ? 'text-indigo-700'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span className="flex-1 text-left">Cambios de clientes</span>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-200 pl-2">
              {subItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
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

      <div className="border-t border-slate-200 p-4 shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
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
          fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 flex flex-col z-50
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
