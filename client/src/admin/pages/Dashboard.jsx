import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ClipboardList, TrendingUp } from 'lucide-react';
import { apiFetch } from '../../shared/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, onboarding: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/clients')
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setStats({
          total: arr.length,
          onboarding: arr.filter((c) => c.admin_status !== 'active').length,
          active: arr.filter((c) => c.admin_status === 'active').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: ClipboardList, label: 'En Onboarding', value: stats.onboarding, color: 'bg-amber-50 text-amber-600' },
    { icon: Users, label: 'Clientes totales', value: stats.total, color: 'bg-blue-50 text-blue-600' },
    { icon: UserCheck, label: 'Activos', value: stats.active, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {cards.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-700">Actividad reciente</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">En desarrollo — próximamente vas a ver tus estadísticas acá.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
