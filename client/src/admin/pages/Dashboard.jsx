import React, { useState, useEffect } from 'react';
import { Plus, Copy, ExternalLink, Users, Clock, AlertCircle, Pencil, X } from 'lucide-react';
import { apiFetch } from '@appresuelve/shared';

const ONBOARDING_URL = import.meta.env.VITE_ONBOARDING_URL || 'http://localhost:5173';

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function ClientForm({ data, onChange, onSubmit, submitLabel, submitting, extraFields }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del negocio <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => onChange({ ...data, businessName: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          value={data.address || ''}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={data.email || ''}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {extraFields}
      <button
        type="submit"
        disabled={submitting || !data.businessName?.trim()}
        className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        {submitting ? 'Guardando...' : submitLabel}
      </button>
    </form>
  );
}

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ businessName: '', email: '', address: '' });
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  const [editingClient, setEditingClient] = useState(null);
  const [editData, setEditData] = useState({ businessName: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const data = await apiFetch('/clients');
      setClients(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setFormData({ businessName: '', email: '', address: '' });
    setLastCreated(null);
    setError(null);
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setFormData({ businessName: '', email: '', address: '' });
    setLastCreated(null);
    setCreating(false);
  }

  function openEditModal(client) {
    setEditData({
      businessName: client.business_name || '',
      email: client.email || '',
      address: client.address || '',
    });
    setEditingClient(client);
    setError(null);
  }

  function closeEditModal() {
    setEditingClient(null);
    setSaving(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.businessName.trim()) return;
    setCreating(true);
    try {
      const client = await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setLastCreated(client);
      setClients((prev) => [client, ...prev]);
      setError(null);
    } catch (error) {
      console.error('Error creating invite:', error);
      setError('Error al crear la invitación');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch(`/clients/${editingClient.id}`, {
        method: 'PUT',
        body: JSON.stringify(editData),
      });
      setClients((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      closeEditModal();
    } catch (error) {
      console.error('Error updating client:', error);
      setError('Error al actualizar el cliente');
    } finally {
      setSaving(false);
    }
  }

  function buildInviteLink(inviteToken) {
    return `${ONBOARDING_URL}/client/${inviteToken}`;
  }

  async function copyLink(inviteToken) {
    const link = buildInviteLink(inviteToken);
    await navigator.clipboard.writeText(link);
    setCopied(inviteToken);
    setTimeout(() => setCopied(null), 2000);
  }

  function getStatusBadge(status) {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      onboarding: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
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
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto pb-28">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes Onboarding</h1>
          <p className="text-slate-500 mt-1">Gestiona las invitaciones de tus clientes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-3 py-3 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline">Nueva Invitación</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : !Array.isArray(clients) || clients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-slate-300" size={48} />
          <p className="text-slate-500">No hay clientes todavía</p>
          <p className="text-sm text-slate-400 mt-1">Creá tu primera invitación</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Cliente</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Progreso</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Link</th>
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
                  <td className="px-6 py-4">{getStatusBadge(client.status)}</td>
                  <td className="px-6 py-4">{getCompletionBar(client.completion || 0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 min-w-[200px]">
                      <button
                        onClick={() => copyLink(client.invite_token)}
                        className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                        title="Copiar link"
                      >
                        {copied === client.invite_token ? (
                          <span className="text-green-600 text-xs font-medium">OK</span>
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <code className="text-xs text-slate-500 truncate max-w-[160px] block">
                        {buildInviteLink(client.invite_token)}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock size={14} />
                      {new Date(client.created_at).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
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
        </div>
      )}

      {showCreateModal && (
        <Modal onClose={closeCreateModal}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Crear Nueva Invitación</h2>
          {lastCreated ? (
            <div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-800 font-medium mb-2">¡Invitación creada!</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border text-sm break-all">
                    {buildInviteLink(lastCreated.invite_token)}
                  </code>
                  <button
                    onClick={() => copyLink(lastCreated.invite_token)}
                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                    title="Copiar link"
                  >
                    {copied === lastCreated.invite_token ? (
                      <span className="text-green-600 text-xs font-medium">OK</span>
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={closeCreateModal}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <ClientForm
              data={formData}
              onChange={setFormData}
              onSubmit={handleCreate}
              submitLabel="Crear Link"
              submitting={creating}
              extraFields={null}
            />
          )}
        </Modal>
      )}

      {editingClient && (
        <Modal onClose={closeEditModal}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Editar Cliente</h2>
          <ClientForm
            data={editData}
            onChange={setEditData}
            onSubmit={handleUpdate}
            submitLabel="Guardar Cambios"
            submitting={saving}
            extraFields={null}
          />
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
