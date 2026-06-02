import React, { useState, useEffect } from 'react';
import { Plus, Copy, ExternalLink, Users, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const CLIENTS_URL = `${API_BASE}/clients`;
const ONBOARDING_URL = import.meta.env.VITE_ONBOARDING_URL || 'http://localhost:5173';

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ businessName: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await fetch(CLIENTS_URL);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInvite(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(CLIENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const client = await res.json();
      setLastCreated(client);
      setFormData({ businessName: '', email: '' });
      fetchClients();
    } catch (error) {
      console.error('Error creating invite:', error);
    } finally {
      setCreating(false);
    }
  }

  function buildInviteLink(inviteToken) {
    return `${ONBOARDING_URL}/client/${inviteToken}`;
  }

  async function copyLink(inviteToken) {
    const link = buildInviteLink(inviteToken);
    await navigator.clipboard.writeText(link);
  }

  function getStatusBadge(status) {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      onboarding: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  }

  function getCompletionBar(completion) {
    const color = completion >= 100 ? 'bg-green-500' : completion >= 50 ? 'bg-blue-500' : 'bg-yellow-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${completion}%` }} />
        </div>
        <span className="text-sm text-slate-600">{completion}%</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes Onboarding</h1>
          <p className="text-slate-500 mt-1">Gestiona las invitaciones de tus clientes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Invitación
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Crear Nueva Invitación</h2>
          <form onSubmit={handleCreateInvite} className="flex gap-4">
            <input
              type="text"
              placeholder="Nombre del negocio (opcional)"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email del cliente (opcional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creando...' : 'Crear Link'}
            </button>
          </form>

          {lastCreated && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">¡Invitación creada!</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                  {buildInviteLink(lastCreated.invite_token)}
                </code>
                <button
                  onClick={() => copyLink(lastCreated.invite_token)}
                  className="p-2 text-slate-600 hover:text-slate-800"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-slate-300" size={48} />
          <p className="text-slate-500">No hay clientes todavía</p>
          <p className="text-sm text-slate-400 mt-1">Creá tu primera invitación</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Cliente</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Progreso</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Creado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{client.business_name || 'Sin nombre'}</div>
                    <div className="text-sm text-slate-500">{client.email || 'Sin email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(client.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getCompletionBar(client.completion || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock size={14} />
                      {new Date(client.created_at).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLink(client.invite_token)}
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copiar link"
                      >
                        <Copy size={18} />
                      </button>
                      <a
                        href={buildInviteLink(client.invite_token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Abrir enlace"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
