import React, { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  ExternalLink,
  Users,
  Clock,
  AlertCircle,
  Pencil,
  X,
  RotateCw,
  Trash2,
} from "lucide-react";
import { apiFetch } from "../../shared/api.js";
import { SERVICE_TYPES } from "../../shared/constants.js";
import { useAlert } from "../components/AlertContext";

const ONBOARDING_URL =
  import.meta.env.VITE_ONBOARDING_URL || "http://localhost:5173";

const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.LANDING_PAGE]: "Landing Page",
  [SERVICE_TYPES.CART_WHATSAPP]: "Sitio web con carrito a Whatsapp",
  [SERVICE_TYPES.CORPORATE]: "Sitio web corporativo",
};

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
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ClientForm({
  data,
  onChange,
  onSubmit,
  submitLabel,
  submitting,
  extraFields,
}) {
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
          value={data.address || ""}
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
          value={data.email || ""}
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
        {submitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const Alert = useAlert();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    address: "",
    serviceType: "",
    apiUrl: "",
  });
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  const [editingClient, setEditingClient] = useState(null);
  const [editData, setEditData] = useState({
    businessName: "",
    email: "",
    address: "",
    serviceType: "",
    apiUrl: "",
  });
  const [saving, setSaving] = useState(false);

  const [syncOpen, setSyncOpen] = useState(false);
  const [syncClient, setSyncClient] = useState(null);
  const [syncSelection, setSyncSelection] = useState({});
  const [syncing, setSyncing] = useState(false);

  const [tab, setTab] = useState('todos');

  const [useHttps, setUseHttps] = useState(true);
  const [editUseHttps, setEditUseHttps] = useState(true);

  const filteredClients = (() => {
    if (tab === 'todos') return clients;
    if (tab === 'onboarding') return clients.filter((c) => c.admin_status !== 'active');
    if (tab === 'activos') return clients.filter((c) => c.admin_status === 'active');
    return clients;
  })();

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const data = await apiFetch("/clients");
      setClients(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setFormData({
      businessName: "",
      email: "",
      address: "",
      serviceType: "",
      apiUrl: "",
    });
    setUseHttps(!window.location.hostname.includes('localhost'));
    setLastCreated(null);
    setError(null);
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setFormData({
      businessName: "",
      email: "",
      address: "",
      serviceType: "",
      apiUrl: "",
    });
    setLastCreated(null);
    setCreating(false);
  }

  function openEditModal(client) {
    const rawUrl = client.api_url || ''
    const protocol = rawUrl.startsWith('http://') ? 'http' : 'https'
    const domain = rawUrl.replace(/^https?:\/\//, '')
    setEditUseHttps(rawUrl.startsWith('https://') || !rawUrl.startsWith('http://'))
    setEditData({
      businessName: client.business_name || '',
      email: client.email || '',
      address: client.address || '',
      serviceType: client.service_type || '',
      apiUrl: domain,
    });
    setEditingClient(client);
    setError(null);
  }

  function closeEditModal() {
    setEditingClient(null);
    setSaving(false);
    setError(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.businessName.trim()) return;
    setCreating(true);
    try {
      const payload = {
        ...formData,
        apiUrl: formData.apiUrl ? `${useHttps ? 'https://' : 'http://'}${formData.apiUrl}` : '',
      }
      console.log("[CREATE] data:", JSON.stringify(payload));
      const client = await apiFetch("/clients", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("[CREATE] success:", client);
      setLastCreated(client);
      setClients((prev) => [client, ...prev]);
      setError(null);
    } catch (error) {
      console.error("[CREATE] error:", error.message);
      setError(error.message || "Error al crear la invitación");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...editData,
        apiUrl: editData.apiUrl ? `${editUseHttps ? 'https://' : 'http://'}${editData.apiUrl}` : '',
      }
      console.log("[UPDATE] data:", JSON.stringify(payload));
      const updated = await apiFetch(`/clients/${editingClient.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      console.log("[UPDATE] success:", updated);
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
      );
      closeEditModal();
    } catch (error) {
      console.error("[UPDATE] error:", error.message);
      setError(error.message || "Error al actualizar el cliente");
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
      pending: "bg-yellow-100 text-yellow-800",
      onboarding: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {status}
      </span>
    );
  }

  function getCompletionBar(completion) {
    const color =
      completion >= 100
        ? "bg-green-500"
        : completion >= 50
          ? "bg-blue-500"
          : "bg-yellow-500";
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <span className="text-sm text-slate-600">{completion}%</span>
      </div>
    );
  }

  async function handleCreateAdmin(client) {
    try {
      await apiFetch(`/clients/${client.id}/create-admin`, { method: "POST" });
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, admin_status: "active" } : c,
        ),
      );
    } catch (err) {
      Alert.fire({ message: err.message || 'Error al crear admin', type: 'error' })
    }
  }

  function openSyncModal(client) {
    const status = client.sync_status || {};
    setSyncClient(client);
    setSyncSelection({
      services: status.services?.status === "ok",
      products: status.products?.status === "ok",
      branding: status.branding?.status === "ok",
      socialLinks:
        status.socialLinks?.status === "ok" || status.redes?.status === "ok",
    });
    setSyncOpen(true);
  }

  async function handleSyncSubmit() {
    const sections = Object.entries(syncSelection)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (sections.length === 0) return;

    setSyncing(true);
    try {
      const result = await apiFetch(`/clients/${syncClient.id}/sync`, {
        method: "POST",
        body: JSON.stringify({ sections }),
      });
      setClients((prev) =>
        prev.map((c) =>
          c.id === syncClient.id ? { ...c, sync_status: result.syncStatus } : c,
        ),
      );
      setSyncOpen(false);
      Alert.fire({ message: 'Sincronización completada', type: 'success' })
    } catch (err) {
      Alert.fire({ message: err.message || 'Error al sincronizar', type: 'error' })
    } finally {
      setSyncing(false);
    }
  }

  async function handleDelete(client) {
    const result = await Alert.fire({
      title: '¿Eliminar cliente?',
      message: `"${client.business_name || 'Sin nombre'}" se eliminará permanentemente junto con todos sus datos.`,
      type: 'warning',
      variant: 'modal',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await apiFetch(`/clients/${client.id}`, { method: 'DELETE' })
      setClients((prev) => prev.filter((c) => c.id !== client.id))
      Alert.fire({ message: 'Cliente eliminado', type: 'success' })
    } catch (err) {
      Alert.fire({ message: err.message || 'Error al eliminar', type: 'error' })
    }
  }

  return (
    <div className="px-2 md:px-8 py-6 md:py-8 max-w-7xl mx-auto pb-28">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'onboarding', label: 'Onboarding' },
          { key: 'activos', label: 'Activos' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : !Array.isArray(filteredClients) || filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-slate-300" size={48} />
          <p className="text-slate-500">No hay clientes todavía</p>
          <p className="text-sm text-slate-400 mt-1">
            Creá tu primera invitación
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Estado
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Servicio
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Progreso
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Admin
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Link
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Creado
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {client.business_name || "Sin nombre"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {client.email || "Sin email"}
                      </div>
                      {client.cloudinary_folder_prefix && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          📁 {client.cloudinary_folder_prefix}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {SERVICE_TYPE_LABELS[client.service_type] || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {getCompletionBar(client.completion || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {client.admin_status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          ✓ Activo
                        </span>
                      ) : client.admin_status === "error" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          ✗ Error
                        </span>
                      ) : client.api_url ? (
                        <button
                          onClick={() => handleCreateAdmin(client)}
                          className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                        >
                          Crear admin
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 min-w-[160px]">
                        <button
                          onClick={() => copyLink(client.invite_token)}
                          className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                          title="Copiar link"
                        >
                          {copied === client.invite_token ? (
                            <span className="text-green-600 text-xs font-medium">
                              OK
                            </span>
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <code className="text-xs text-slate-500 truncate max-w-[120px] block">
                          {buildInviteLink(client.invite_token)}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock size={14} />
                        {new Date(client.created_at).toLocaleDateString(
                          "es-AR",
                        )}
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
                        {client.api_url && (
                          <button
                            onClick={() => openSyncModal(client)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Sincronizar"
                          >
                            <RotateCw size={18} />
                          </button>
                        )}
                        <a
                          href={buildInviteLink(client.invite_token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Abrir enlace"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button
                          onClick={() => handleDelete(client)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
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
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Crear Nueva Invitación
          </h2>
          {lastCreated ? (
            <div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  ¡Invitación creada!
                </p>
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
                      <span className="text-green-600 text-xs font-medium">
                        OK
                      </span>
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
              extraFields={
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo de servicio
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serviceType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {Object.entries(SERVICE_TYPE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      URL de la API
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUseHttps(!useHttps)}
                        className={`px-3 py-2 rounded-lg border text-sm font-mono transition-colors ${
                          useHttps
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-slate-100 border-slate-300 text-slate-500'
                        }`}
                      >
                        {useHttps ? 'https://' : 'http://'}
                      </button>
                      <input
                        type="text"
                        value={formData.apiUrl}
                        onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                        placeholder="api.acuamare.com"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              }
            />
          )}
        </Modal>
      )}

      {editingClient && (
        <Modal onClose={closeEditModal}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Editar Cliente
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <ClientForm
            data={editData}
            onChange={setEditData}
            onSubmit={handleUpdate}
            submitLabel="Guardar Cambios"
            submitting={saving}
            extraFields={
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de servicio
                  </label>
                  <select
                    value={editData.serviceType}
                    onChange={(e) =>
                      setEditData({ ...editData, serviceType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {Object.entries(SERVICE_TYPE_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL de la API
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditUseHttps(!editUseHttps)}
                      className={`px-3 py-2 rounded-lg border text-sm font-mono transition-colors ${
                        editUseHttps
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-100 border-slate-300 text-slate-500'
                      }`}
                    >
                      {editUseHttps ? 'https://' : 'http://'}
                    </button>
                    <input
                      type="text"
                      value={editData.apiUrl}
                      onChange={(e) => setEditData({ ...editData, apiUrl: e.target.value })}
                      placeholder="api.acuamare.com"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            }
          />
        </Modal>
      )}

      {syncOpen && (
        <Modal onClose={() => setSyncOpen(false)}>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Sincronizar: {syncClient?.business_name}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Seleccioná qué datos enviar al panel del cliente.
          </p>

          <div className="space-y-3 mb-6">
            {[
              {
                key: "services",
                label: "Servicios",
                info:
                  syncClient?.sync_status?.services?.status === "ok"
                    ? "✓ Sincronizado"
                    : `${syncClient?.form_data?.services?.length || 0} items`,
              },
              {
                key: "products",
                label: "Productos",
                info:
                  syncClient?.sync_status?.products?.status === "ok"
                    ? "✓ Sincronizado"
                    : "Excel + imágenes",
              },
              {
                key: "branding",
                label: "Branding",
                info:
                  syncClient?.sync_status?.branding?.status === "ok"
                    ? "✓ Sincronizado"
                    : "Logo, colores, descripción",
              },
              {
                key: "socialLinks",
                label: "Redes Sociales",
                info:
                  syncClient?.sync_status?.socialLinks?.status === "ok" ||
                  syncClient?.sync_status?.redes?.status === "ok"
                    ? "✓ Sincronizado"
                    : "Links sociales",
              },
            ].map(({ key, label, info }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={syncSelection[key] || false}
                  onChange={(e) =>
                    setSyncSelection((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">{info}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setSyncOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSyncSubmit}
              disabled={syncing || !Object.values(syncSelection).some(Boolean)}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Clients;
