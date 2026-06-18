import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Copy,
  ExternalLink,
  Users,
  Clock,
  AlertCircle,
  Pencil,
  X,
  RefreshCw,
  Trash2,
  UserPlus,
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
      <div className="relative bg-[var(--color-bg-card)] rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
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
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          Nombre del negocio <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => onChange({ ...data, businessName: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          Dirección
        </label>
        <input
          type="text"
          value={data.address || ""}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          Email
        </label>
        <input
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>
      {extraFields}
      <button
        type="submit"
        disabled={submitting || !data.businessName?.trim()}
        className="w-full px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors font-medium"
      >
        {submitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

function Clients({ view = "onboarding" }) {
  const navigate = useNavigate();
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

  const [useHttps, setUseHttps] = useState(true);
  const [editUseHttps, setEditUseHttps] = useState(true);

  const isOnboarding = view === "onboarding";
  const isActivos = view === "activos";

  const filteredClients = isOnboarding
    ? clients.filter((c) => c.admin_status !== "active")
    : clients.filter((c) => c.admin_status === "active");

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
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
      onboarding: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {status}
      </span>
    );
  }

  function getBillingBadge(status) {
    const styles = {
      pending_activation: "bg-[var(--color-bg-section)] text-[var(--color-text-secondary)]",
      active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      past_due: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
      suspended: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
      cancelled: "bg-[var(--color-bg-section)] text-[var(--color-text-muted)]",
    };
    const labels = {
      pending_activation: "Pendiente",
      active: "Activo",
      past_due: "Vencido",
      suspended: "Suspendido",
      cancelled: "Cancelado",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending_activation}`}>
        {labels[status] || status}
      </span>
    );
  }

  function getCompletionBar(completion) {
    const color =
      completion >= 100
        ? "bg-green-500"
        : completion >= 50
          ? "bg-[var(--color-primary)]"
          : "bg-yellow-500";
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-[var(--color-bg-section)] rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <span className="text-sm text-[var(--color-text-secondary)]">{completion}%</span>
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {isOnboarding ? "Onboarding" : "Activos"}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {isOnboarding
              ? "Clientes pendientes de activación"
              : "Clientes activos con admin creado"}
          </p>
        </div>
        {isOnboarding && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3 py-3 md:px-4 md:py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <Plus className="w-6 h-6 md:w-5 md:h-5" />
            <span className="hidden md:inline">Nueva Invitación</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">Cargando...</div>
      ) : !Array.isArray(filteredClients) || filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-[var(--color-text-muted)]" size={48} />
          <p className="text-[var(--color-text-secondary)]">No hay clientes todavía</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Creá tu primera invitación
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[var(--color-bg-section)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                    Cliente
                  </th>
                  {isOnboarding && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                      Estado
                    </th>
                  )}
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                    Servicio
                  </th>
                  {isOnboarding && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                      Progreso
                    </th>
                  )}
                  {isOnboarding && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                      Admin
                    </th>
                  )}
                  {isActivos && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                      Billing
                    </th>
                  )}
                  {isOnboarding && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                      Link Onboarding
                    </th>
                  )}
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                    Creado
                  </th>
                  {isOnboarding && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className={`hover:bg-[var(--color-bg-elevated)] ${isActivos ? "cursor-pointer" : ""}`}
                    onClick={isActivos ? () => navigate(`/clientes/activos/${client.id}`) : undefined}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {client.business_name || "Sin nombre"}
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {client.email || "Sin email"}
                      </div>
                      {client.cloudinary_folder_prefix && (
                        <div className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                          {client.cloudinary_folder_prefix}
                        </div>
                      )}
                    </td>
                    {isOnboarding && (
                      <td className="px-6 py-4">
                        {getStatusBadge(client.onboarding_status)}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {SERVICE_TYPE_LABELS[client.service_type] || "—"}
                    </td>
                    {isOnboarding && (
                      <td className="px-6 py-4">
                        {getCompletionBar(client.completion || 0)}
                      </td>
                    )}
                    {isOnboarding && (
                      <td className="px-6 py-4">
                        {client.admin_status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 whitespace-nowrap">
                            ✓ Activo
                          </span>
                        ) : client.admin_status === "error" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 whitespace-nowrap">
                            ✗ Error
                          </span>
                        ) : client.api_url ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCreateAdmin(client); }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-[var(--color-primary)] hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors whitespace-nowrap"
                          >
                            <UserPlus size={12} />
                            Crear admin
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>
                    )}
                    {isActivos && (
                      <td className="px-6 py-4">
                        {getBillingBadge(client.billing_status)}
                      </td>
                    )}
                    {isOnboarding && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 min-w-[160px]">
                          <a
                            href={buildInviteLink(client.invite_token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
                            title="Abrir enlace"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyLink(client.invite_token); }}
                            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
                            title="Copiar link"
                          >
                            {copied === client.invite_token ? (
                              <span className="text-green-600 dark:text-green-400 text-xs font-medium">OK</span>
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                          <code className="text-xs text-[var(--color-text-muted)] truncate max-w-[120px] block">
                            {buildInviteLink(client.invite_token)}
                          </code>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                        <Clock size={14} />
                        {new Date(client.created_at).toLocaleDateString("es-AR")}
                      </div>
                    </td>
                    {isOnboarding && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(client); }}
                            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                          {client.api_url && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openSyncModal(client); }}
                              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-indigo-50 dark:bg-indigo-950 rounded-lg transition-colors"
                              title="Sincronizar"
                            >
                              <RefreshCw size={18} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(client); }}
                            className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <Modal onClose={closeCreateModal}>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Crear Nueva Invitación
          </h2>
          {lastCreated ? (
            <div>
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-500/20 rounded-lg mb-4">
                <p className="text-sm text-green-800 dark:text-green-400 font-medium mb-2">
                  ¡Invitación creada!
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[var(--color-bg-card)] px-3 py-2 rounded border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] break-all">
                    {buildInviteLink(lastCreated.invite_token)}
                  </code>
                  <button
                    onClick={() => copyLink(lastCreated.invite_token)}
                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors shrink-0"
                    title="Copiar link"
                  >
                    {copied === lastCreated.invite_token ? (
                      <span className="text-green-600 dark:text-green-400 text-xs font-medium">
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
                className="w-full px-4 py-2 bg-[var(--color-bg-section)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
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
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
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
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                      URL de la API
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUseHttps(!useHttps)}
                        className={`px-3 py-2 rounded-lg border text-sm font-mono transition-colors ${
                          useHttps
                            ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400'
                            : 'bg-[var(--color-bg-section)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {useHttps ? 'https://' : 'http://'}
                      </button>
                      <input
                        type="text"
                        value={formData.apiUrl}
                        onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                        placeholder="api.acuamare.com"
                        className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Editar Cliente
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Tipo de servicio
                  </label>
                  <select
                    value={editData.serviceType}
                    onChange={(e) =>
                      setEditData({ ...editData, serviceType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    URL de la API
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditUseHttps(!editUseHttps)}
                      className={`px-3 py-2 rounded-lg border text-sm font-mono transition-colors ${
                        editUseHttps
                          ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400'
                          : 'bg-[var(--color-bg-section)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {editUseHttps ? 'https://' : 'http://'}
                    </button>
                    <input
                      type="text"
                      value={editData.apiUrl}
                      onChange={(e) => setEditData({ ...editData, apiUrl: e.target.value })}
                      placeholder="api.acuamare.com"
                      className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Sincronizar: {syncClient?.business_name}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
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
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] cursor-pointer"
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
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {label}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-2">{info}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setSyncOpen(false)}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSyncSubmit}
              disabled={syncing || !Object.values(syncSelection).some(Boolean)}
              className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
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
