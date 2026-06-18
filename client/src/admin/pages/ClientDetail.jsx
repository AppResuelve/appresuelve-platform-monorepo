import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Settings,
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

const BILLING_LABELS = {
  pending_activation: "Pendiente activación",
  active: "Activo",
  past_due: "Vencido",
  suspended: "Suspendido",
  cancelled: "Cancelado",
};

function DetailField({ label, value, mono, copyable }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div>
        <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </dt>
        <dd className="mt-1 text-sm text-[var(--color-text-muted)]">—</dd>
      </div>
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
        {label}
      </dt>
      <dd className={`mt-1 text-sm text-[var(--color-text-primary)] ${mono ? "font-mono" : ""}`}>
        <span className="break-all">{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="ml-2 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] inline-flex"
            title="Copiar"
          >
            {copied ? (
              <CheckCircle size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        )}
      </dd>
    </div>
  );
}

function DetailSection({ title, headerAction, children }) {
  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {headerAction}
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</dl>
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const Alert = useAlert();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState({});
  const [editUseHttps, setEditUseHttps] = useState(true);
  const [saving, setSaving] = useState(false);

  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingData, setBillingData] = useState({
    billing_day: "",
    grace_days: "",
  });
  const [savingBilling, setSavingBilling] = useState(false);
  const [billingEditing, setBillingEditing] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);

  async function fetchClient() {
    try {
      const data = await apiFetch(`/clients`);
      const found = data.find((c) => c.id === id);
      if (!found) {
        setError("Cliente no encontrado");
      } else {
        setClient(found);
      }
    } catch (err) {
      setError(err.message || "Error al cargar el cliente");
    } finally {
      setLoading(false);
    }
  }

  function loadEditData(sectionKey) {
    if (sectionKey === 'business') {
      const rawUrl = client.api_url || '';
      const domain = rawUrl.replace(/^https?:\/\//, '');
      setEditUseHttps(rawUrl.startsWith('https://') || !rawUrl.startsWith('http://'));
      return {
        businessName: client.business_name || '',
        email: client.email || '',
        address: client.address || '',
        phone: client.phone || '',
        description: client.description || '',
        domain: client.domain || '',
        notes: client.notes || '',
      };
    }
    if (sectionKey === 'service') {
      const rawUrl = client.api_url || '';
      const domain = rawUrl.replace(/^https?:\/\//, '');
      setEditUseHttps(rawUrl.startsWith('https://') || !rawUrl.startsWith('http://'));
      return {
        serviceType: client.service_type || '',
        domain: client.domain || '',
        apiUrl: domain,
      };
    }
    return {};
  }

  async function startEditSection(sectionKey) {
    if (editingSection && editingSection !== sectionKey) {
      const result = await Alert.fire({
        title: '¿Descartar cambios?',
        message: `Tenés cambios sin guardar en "${editingSection === 'business' ? 'Datos del negocio' : 'Servicio e infraestructura'}"`,
        type: 'warning',
        variant: 'modal',
        showCancelButton: true,
        confirmButtonText: 'Descartar',
        cancelButtonText: 'Cancelar',
      });
      if (!result.isConfirmed) return;
    }
    setEditData(loadEditData(sectionKey));
    setEditingSection(sectionKey);
  }

  function cancelEditSection() {
    setEditingSection(null);
    setEditData({});
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...editData,
        apiUrl: editData.apiUrl
          ? `${editUseHttps ? "https://" : "http://"}${editData.apiUrl}`
          : "",
      };
      const updated = await apiFetch(`/clients/${client.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setClient((prev) => ({ ...prev, ...updated }));
      setEditingSection(null);
      setEditData({});
      Alert.fire({ message: "Cambios guardados", type: "success" });
    } catch (err) {
      Alert.fire({
        message: err.message || "Error al actualizar",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function buildInviteLink(inviteToken) {
    return `${ONBOARDING_URL}/client/${inviteToken}`;
  }

  function openBillingSettings() {
    setBillingData({
      billing_day: client.billing_day || "",
      grace_days: client.grace_days || 7,
    });
    setBillingModalOpen(true);
  }

  async function handleBillingChange(e) {
    const newStatus = e.target.value;
    setBillingEditing(false);

    if (newStatus === client.billing_status) return;

    const result = await Alert.fire({
      title: "¿Cambiar estado?",
      message: `El estado cambiará a "${BILLING_LABELS[newStatus]}"`,
      type: "warning",
      variant: "modal",
      showCancelButton: true,
      confirmButtonText: "Cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const updated = await apiFetch(`/clients/${client.id}/billing`, {
        method: "PUT",
        body: JSON.stringify({ billing_status: newStatus }),
      });
      setClient((prev) => ({ ...prev, ...updated }));
      Alert.fire({ message: "Estado actualizado", type: "success" });
    } catch (err) {
      Alert.fire({
        message: err.message || "Error al actualizar",
        type: "error",
      });
    }
  }

  async function handleBillingSettingsSubmit(e) {
    e.preventDefault();
    setSavingBilling(true);
    try {
      const payload = {
        billing_status: client.billing_status,
        billing_day: billingData.billing_day
          ? Number(billingData.billing_day)
          : null,
        grace_days: billingData.grace_days ? Number(billingData.grace_days) : 7,
      };
      const updated = await apiFetch(`/clients/${client.id}/billing`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setClient((prev) => ({ ...prev, ...updated }));
      setBillingModalOpen(false);
      Alert.fire({
        message: "Ajustes de facturación actualizados",
        type: "success",
      });
    } catch (err) {
      Alert.fire({
        message: err.message || "Error al actualizar",
        type: "error",
      });
    } finally {
      setSavingBilling(false);
    }
  }

  function getAdminBadge(status) {
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
          <CheckCircle size={12} /> Activo
        </span>
      );
    }
    if (status === "error") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
          <XCircle size={12} /> Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-bg-section)] text-[var(--color-text-muted)]">
        Pendiente
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
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending_activation}`}
      >
        {BILLING_LABELS[status] || status}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="px-2 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="text-center py-12 text-[var(--color-text-muted)]">Cargando...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="px-2 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            {error || "Cliente no encontrado"}
          </p>
        </div>
        <button
          onClick={() => navigate("/clientes/activos")}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} /> Volver a Activos
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-8 py-6 md:py-8 max-w-7xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate("/clientes/activos")}
            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] mb-2"
          >
            <ArrowLeft size={16} /> Volver a Activos
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {client.business_name || "Sin nombre"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {getAdminBadge(client.admin_status)}
            {getBillingBadge(client.billing_status)}
            {client.service_type && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-[var(--color-primary)]">
                {SERVICE_TYPE_LABELS[client.service_type] ||
                  client.service_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sections — 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-4 items-start">
        {/* Left column */}
        <div className="space-y-4">
          <DetailSection
            title="Datos del negocio"
            headerAction={
              editingSection !== 'business' && (
                <button
                  onClick={() => startEditSection('business')}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors"
                  title="Editar datos del negocio"
                >
                  <Pencil size={14} />
                </button>
              )
            }
          >
            {editingSection === 'business' ? (
              <>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Nombre del negocio</dt>
                  <dd className="mt-1">
                    <input type="text" value={editData.businessName} onChange={(e) => setEditData({ ...editData, businessName: e.target.value })} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Email</dt>
                  <dd className="mt-1">
                    <input type="email" value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Dirección</dt>
                  <dd className="mt-1">
                    <input type="text" value={editData.address || ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Teléfono</dt>
                  <dd className="mt-1">
                    <input type="text" value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Descripción</dt>
                  <dd className="mt-1">
                    <textarea value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={2} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Notas</dt>
                  <dd className="mt-1">
                    <textarea value={editData.notes || ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={2} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={cancelEditSection} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancelar</button>
                  <button type="button" onClick={handleUpdate} disabled={saving || !editData.businessName?.trim()} className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50">
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <DetailField label="Nombre" value={client.business_name} />
                <DetailField label="Email" value={client.email} />
                <DetailField label="Dirección" value={client.address} />
                <DetailField label="Teléfono" value={client.phone} />
                <DetailField label="Descripción" value={client.description} />
                <DetailField label="Notas" value={client.notes} />
              </>
            )}
          </DetailSection>

          <DetailSection
            title="Servicio e infraestructura"
            headerAction={
              editingSection !== 'service' && (
                <button
                  onClick={() => startEditSection('service')}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors"
                  title="Editar servicio e infraestructura"
                >
                  <Pencil size={14} />
                </button>
              )
            }
          >
            {editingSection === 'service' ? (
              <>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Tipo de servicio</dt>
                  <dd className="mt-1">
                    <select value={editData.serviceType} onChange={(e) => setEditData({ ...editData, serviceType: e.target.value })} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                      <option value="">Seleccionar...</option>
                      {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Dominio</dt>
                  <dd className="mt-1">
                    <input type="text" value={editData.domain || ""} onChange={(e) => setEditData({ ...editData, domain: e.target.value })} className="text-sm w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">URL de API</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <button type="button" onClick={() => setEditUseHttps(!editUseHttps)} className={`px-2.5 py-1.5 rounded-lg border text-sm font-mono transition-colors ${editUseHttps ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400" : "bg-[var(--color-bg-section)] border-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
                      {editUseHttps ? "https://" : "http://"}
                    </button>
                    <input type="text" value={editData.apiUrl} onChange={(e) => setEditData({ ...editData, apiUrl: e.target.value })} placeholder="api.ejemplo.com" className="flex-1 text-sm px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                  </dd>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={cancelEditSection} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancelar</button>
                  <button type="button" onClick={handleUpdate} disabled={saving} className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50">
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <DetailField
                  label="Tipo de servicio"
                  value={SERVICE_TYPE_LABELS[client.service_type] || client.service_type}
                />
                <DetailField label="Dominio" value={client.domain} mono />
                <DetailField label="URL de API" value={client.api_url} mono copyable />
                <DetailField label="Admin" value={client.admin_status} />
              </>
            )}
          </DetailSection>

          <DetailSection title="Identificadores">
            <DetailField
              label="Cloudinary Prefix"
              value={client.cloudinary_folder_prefix}
              mono
              copyable
            />
            <DetailField
              label="Git Repo"
              value={client.git_repo}
              mono
              copyable
            />
            <DetailField
              label="Backend Repo"
              value={client.backend_repo}
              mono
              copyable
            />
            <DetailField
              label="Frontend Repo"
              value={client.frontend_repo}
              mono
              copyable
            />
          </DetailSection>

          {client.sync_status && Object.keys(client.sync_status).length > 0 && (
            <DetailSection title="Sincronización">
              {Object.entries(client.sync_status).map(([key, val]) => (
                <DetailField
                  key={key}
                  label={key}
                  value={
                    val?.status === "ok"
                      ? `✓ ${val.at ? new Date(val.at).toLocaleDateString("es-AR") : "OK"}`
                      : "Pendiente"
                  }
                />
              ))}
            </DetailSection>
          )}

          <DetailSection title="Onboarding">
            <DetailField
              label="Fecha de creación"
              value={
                client.created_at
                  ? new Date(client.created_at).toLocaleDateString("es-AR")
                  : null
              }
            />
            <DetailField
              label="Link de onboarding"
              value={
                client.invite_token
                  ? buildInviteLink(client.invite_token)
                  : null
              }
              mono
            />
          </DetailSection>
        </div>

        {/* Right column — sticky */}
        <div className="md:sticky md:top-6">
          <DetailSection
            title="Facturación"
            headerAction={
              <button
                onClick={openBillingSettings}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors"
                title="Ajustes de facturación"
              >
                <Settings size={16} />
              </button>
            }
          >
            <div className="md:col-span-2">
              <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Estado
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                <select
                  value={client.billing_status}
                  onChange={handleBillingChange}
                  disabled={!billingEditing}
                  className={`text-sm rounded-lg border px-3 py-1.5 transition-colors ${
                    billingEditing
                      ? "border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      : "border-transparent bg-[var(--color-bg-section)] text-[var(--color-text-secondary)] cursor-default"
                  }`}
                >
                  {Object.entries(BILLING_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setBillingEditing(!billingEditing)}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors shrink-0"
                  title={billingEditing ? "Cancelar" : "Editar estado"}
                >
                  <Pencil size={14} />
                </button>
              </dd>
            </div>
            <DetailField
              label="Día de facturación"
              value={client.billing_day ? `Día ${client.billing_day}` : null}
            />
            <DetailField
              label="Período actual"
              value={
                client.current_period_start && client.current_period_end
                  ? `${new Date(client.current_period_start).toLocaleDateString("es-AR")} — ${new Date(client.current_period_end).toLocaleDateString("es-AR")}`
                  : null
              }
            />
            <DetailField
              label="Días restantes"
              value={
                client.days_remaining != null
                  ? `${client.days_remaining} días`
                  : null
              }
            />
            {client.billing_status === "past_due" && (
              <>
                <DetailField
                  label="Gracia hasta"
                  value={
                    client.grace_until
                      ? new Date(client.grace_until).toLocaleDateString("es-AR")
                      : null
                  }
                />
                <DetailField
                  label="Días de gracia restantes"
                  value={
                    client.grace_days_remaining != null
                      ? `${client.grace_days_remaining} días`
                      : null
                  }
                />
              </>
            )}
            {client.suspended_at && (
              <DetailField
                label="Suspendido el"
                value={new Date(client.suspended_at).toLocaleDateString(
                  "es-AR",
                )}
              />
            )}
            {client.cancelled_at && (
              <DetailField
                label="Cancelado el"
                value={new Date(client.cancelled_at).toLocaleDateString(
                  "es-AR",
                )}
              />
            )}
          </DetailSection>
        </div>
      </div>

      {/* Billing Settings Modal */}
      {billingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setBillingModalOpen(false)}
          />
          <div className="relative bg-[var(--color-bg-card)] rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBillingModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Ajustes de facturación
              </h2>
              <form
                onSubmit={handleBillingSettingsSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Día de facturación
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingData.billing_day}
                    onChange={(e) =>
                      setBillingData({
                        ...billingData,
                        billing_day: e.target.value,
                      })
                    }
                    placeholder="15"
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Días de gracia
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={billingData.grace_days}
                    onChange={(e) =>
                      setBillingData({
                        ...billingData,
                        grace_days: e.target.value,
                      })
                    }
                    placeholder="7"
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setBillingModalOpen(false)}
                    className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingBilling}
                    className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                  >
                    {savingBilling ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
