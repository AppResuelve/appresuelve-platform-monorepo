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
  CreditCard,
  Pause,
  Play,
  Ban,
  Save,
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

  const [savingBilling, setSavingBilling] = useState(false);

  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState('');
  const [feeSaving, setFeeSaving] = useState(false);

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

  async function saveFee() {
    setFeeSaving(true);
    try {
      const updated = await apiFetch(`/clients/${client.id}`, {
        method: "PUT",
        body: JSON.stringify({ monthlyFee: feeValue ? Number(feeValue) : null }),
      });
      setClient((prev) => ({ ...prev, ...updated }));
      setEditingFee(false);
      Alert.fire({ message: "Importe actualizado", type: "success" });
    } catch (err) {
      Alert.fire({ message: err.message || "Error al actualizar", type: "error" });
    } finally {
      setFeeSaving(false);
    }
  }

  function buildInviteLink(inviteToken) {
    return `${ONBOARDING_URL}/client/${inviteToken}`;
  }

  async function handleBillingAction(action) {
    const labels = {
      active: "Activar",
      suspended: "Suspender",
      cancelled: "Cancelar",
    };

    const result = await Alert.fire({
      title: `¿${labels[action] || action}?`,
      message: `El estado de facturación cambiará a "${BILLING_LABELS[action]}"`,
      type: "warning",
      variant: "modal",
      showCancelButton: true,
      confirmButtonText: labels[action] || "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setSavingBilling(true);
    try {
      const updated = await apiFetch(`/clients/${client.id}/billing`, {
        method: "PUT",
        body: JSON.stringify({ billing_status: action }),
      });
      setClient((prev) => ({ ...prev, ...updated }));
      Alert.fire({ message: "Estado actualizado", type: "success" });
    } catch (err) {
      Alert.fire({
        message: err.message || "Error al actualizar",
        type: "error",
      });
    } finally {
      setSavingBilling(false);
    }
  }

  async function handleRegisterPayment() {
    const result = await Alert.fire({
      title: "¿Registrar pago?",
      message: "Se iniciará un nuevo ciclo de facturación",
      type: "warning",
      variant: "modal",
      showCancelButton: true,
      confirmButtonText: "Registrar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setSavingBilling(true);
    try {
      const updated = await apiFetch(`/clients/${client.id}/register-payment`, {
        method: "POST",
      });
      setClient((prev) => ({ ...prev, ...updated }));
      Alert.fire({ message: "Pago registrado, nuevo ciclo iniciado", type: "success" });
    } catch (err) {
      Alert.fire({
        message: err.message || "Error al registrar pago",
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
          <DetailSection title="Facturación">
            <div className="md:col-span-2">
              <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Importe mensual
              </dt>
              <dd className="mt-1">
                {editingFee ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={feeValue}
                      onChange={(e) => setFeeValue(e.target.value)}
                      className="w-32 px-2 py-1 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                      autoFocus
                    />
                    <button
                      onClick={saveFee}
                      disabled={feeSaving}
                      className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-950 text-green-600 transition-colors"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditingFee(false)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {client.monthly_fee != null
                        ? `$ ${Number(client.monthly_fee).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "—"}
                    </span>
                    <button
                      onClick={() => {
                        setFeeValue(client.monthly_fee || '');
                        setEditingFee(true);
                      }}
                      className="p-0.5 rounded hover:bg-[var(--color-bg-section)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Estado
              </dt>
              <dd className="mt-1">
                {getBillingBadge(client.billing_status)}
              </dd>
            </div>
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

            {/* Billing Actions */}
            <div className="md:col-span-2 pt-4 border-t border-[var(--color-border)]">
              <div className="flex flex-wrap gap-2">
                {client.billing_status === "pending_activation" && (
                  <button
                    onClick={() => handleBillingAction("active")}
                    disabled={savingBilling}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 disabled:opacity-50"
                  >
                    <Play size={14} />
                    Activar Facturación
                  </button>
                )}

                {["active", "past_due", "suspended"].includes(client.billing_status) && (
                  <button
                    onClick={handleRegisterPayment}
                    disabled={savingBilling}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900 disabled:opacity-50"
                  >
                    <CreditCard size={14} />
                    Registrar Pago
                  </button>
                )}

                {["active", "past_due"].includes(client.billing_status) && (
                  <button
                    onClick={() => handleBillingAction("suspended")}
                    disabled={savingBilling}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:hover:bg-yellow-900 disabled:opacity-50"
                  >
                    <Pause size={14} />
                    Suspender
                  </button>
                )}

                {client.billing_status === "suspended" && (
                  <button
                    onClick={() => handleBillingAction("active")}
                    disabled={savingBilling}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 disabled:opacity-50"
                  >
                    <Play size={14} />
                    Reactivar
                  </button>
                )}

                {client.billing_status !== "cancelled" && (
                  <button
                    onClick={() => handleBillingAction("cancelled")}
                    disabled={savingBilling}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 disabled:opacity-50"
                  >
                    <Ban size={14} />
                    Cancelar Servicio
                  </button>
                )}
              </div>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
