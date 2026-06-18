import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Check,
  Loader2,
  AlertCircle,
  Menu,
  X,
  Pencil,
} from 'lucide-react';
import { getClientByToken, saveOnboardingData } from '../../shared/api.js';
import StepIndicator from '../components/StepIndicator';
import ServicesStep from '../components/ServicesStep';
import ProductsStep from '../components/ProductsStep';
import SocialLinksStep from '../components/SocialLinksStep';
import BrandingStep from '../components/BrandingStep';
import SaveIndicator from '../../shared/components/SaveIndicator';

const STEPS = [
  { key: 'services', label: 'Servicios', component: ServicesStep },
  { key: 'products', label: 'Productos', component: ProductsStep },
  { key: 'socialLinks', label: 'Redes Sociales', component: SocialLinksStep },
  { key: 'branding', label: 'Branding', component: BrandingStep },
];

const INITIAL_DATA = {
  services: [],
  products: {},
  socialLinks: {},
  branding: {},
};

function isStepComplete(key, data, documents) {
  if (!data) return false;
  switch (key) {
    case 'services':
      return data.length > 0 && data.every((s) => s.name && s.description && s.price);
    case 'products':
      if (!documents || documents.length === 0) return false;
      return documents.some((d) => d.document_type === 'product_files') &&
             documents.some((d) => d.document_type === 'product_images');
    case 'socialLinks':
      return Object.values(data || {}).filter(Boolean).length >= 3;
    case 'branding':
      return !!(data.businessName && data.description && data.colors);
    default:
      return false;
  }
}

function getStepPercentage(key, data, documents) {
  if (!data) return 0;
  switch (key) {
    case 'services': {
      if (data.length === 0) return 0
      const fieldsPerService = 3 // name, description, price
      const totalFields = data.length * fieldsPerService
      let filled = 0
      data.forEach((s) => {
        if (s.name) filled++
        if (s.description) filled++
        if (s.price) filled++
      })
      return Math.round((filled / totalFields) * 100)
    }
    case 'products': {
      if (!documents || documents.length === 0) return 0
      const hasFiles = documents.some((d) => d.document_type === 'product_files')
      const hasImages = documents.some((d) => d.document_type === 'product_images')
      if (hasFiles && hasImages) return 100
      if (hasFiles || hasImages) return 50
      return 0
    }
    case 'socialLinks': {
      const socialKeys = ['instagram', 'facebook', 'whatsapp', 'tiktok', 'youtube'];
      const filled = socialKeys.filter((k) => data[k]).length;
      return filled > 0 ? Math.round((filled / socialKeys.length) * 100) : 0;
    }
    case 'branding': {
      const brandFields = [data.businessName, data.description, data.colors];
      const brandWeight = [35, 35, 30];
      return brandFields.reduce((sum, f, i) => sum + (f ? brandWeight[i] : 0), 0);
    }
    default:
      return 0;
  }
}

function getCompletedArray(formData, documents) {
  return STEPS.map((s) => isStepComplete(s.key, formData[s.key], documents));
}

function SidebarStep({ index, label, isCurrent, isComplete, isPast, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        isCurrent ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-[var(--color-bg-elevated)]'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
          isComplete
            ? 'bg-green-500 text-white'
            : isCurrent
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-[var(--color-bg-section)] text-[var(--color-text-muted)]'
        }`}
      >
        {isComplete ? <Check size={14} /> : index + 1}
      </div>
      <span
        className={`text-sm ${
          isCurrent
            ? 'text-[var(--color-primary)] font-medium'
            : isComplete
            ? 'text-green-600 dark:text-green-400'
            : 'text-[var(--color-text-muted)]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function StepFooter({ step, totalSteps, isLastStep, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <button
        onClick={onPrev}
        disabled={step === 0}
        className="flex items-center gap-1.5 px-3 py-2.5 text-base text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <span className="text-sm text-[var(--color-text-muted)] font-medium">
        {step + 1} / {totalSteps}
      </span>

      <button
        onClick={onNext}
        className="flex items-center gap-1.5 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors text-base font-medium"
      >
        {isLastStep ? (
          <>
            <CheckCircle size={18} />
            Finalizar
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Siguiente</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}

function OnboardingPage() {
  const { hash } = useParams();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [finished, setFinished] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [expired, setExpired] = useState(false);

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    async function load() {
      try {
        const clientData = await getClientByToken(hash);
        setClient(clientData);

        if (clientData.admin_status === 'active') {
          setExpired(true);
          return;
        }

        const saved = clientData.form_data || {};

        if (!saved.intro_accepted) {
          setShowIntro(true);
        }

        if (Object.keys(saved).length > 0) {
          const clean = { ...saved };

          if (clean.colors) {
            clean.branding = { ...(clean.branding || {}), ...clean.colors };
            delete clean.colors;
          }

          delete clean.current_step;
          delete clean.intro_accepted;

          setFormData({ ...INITIAL_DATA, ...clean });
        }

        const lsStep = localStorage.getItem('ons_step_' + hash);
        if (lsStep !== null) {
          const n = Number(lsStep);
          if (n >= 0 && n < STEPS.length) setStep(n);
        }

        if (clientData.status === 'completed') {
          setFinished(true);
        }
      } catch (err) {
        setError(
          err.message === 'Invitation not found'
            ? 'Link de invitación inválido o expirado.'
            : 'Error al cargar los datos. Verificá tu conexión.'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hash]);

  const saveTimeoutRef = useRef(null);

  const save = useCallback(
    async (data) => {
      setSaveStatus('saving');
      try {
        await saveOnboardingData(hash, data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    },
    [hash]
  );

  function triggerSave(data) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => save(data), 2000);
  }

  function updateSection(section, data) {
    if (expired) return;
    setFormData((prev) => {
      const next = { ...prev, [section]: data };
      triggerSave(next);
      return next;
    });
  }

  function goToStep(targetStep) {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      save(formDataRef.current);
    }
    if (targetStep >= 0 && targetStep < STEPS.length) {
      setStep(targetStep);
      localStorage.setItem('ons_step_' + hash, targetStep);
    } else {
      setFinished(true);
    }
    setMenuOpen(false);
  }

  function nextStep() {
    goToStep(step < STEPS.length - 1 ? step + 1 : -1);
  }

  function prevStep() {
    goToStep(step - 1);
  }

  async function acceptIntro() {
    if (expired) return;
    try {
      await saveOnboardingData(hash, { ...formData, intro_accepted: true });
    } catch {
      // non-blocking
    }
    setShowIntro(false);
  }

  function editStep(i) {
    setFinished(false);
    setStep(i);
    localStorage.setItem('ons_step_' + hash, i);
  }

  const completedArray = getCompletedArray(formData, client?.documents);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-[var(--color-primary)]" size={40} />
          <p className="text-[var(--color-text-muted)]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Link inválido</h1>
          <p className="text-[var(--color-text-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--color-bg-section)] rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-[var(--color-text-muted)]" size={32} />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
            Este enlace ya no está disponible
          </h1>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Podés modificar los datos de tu sitio desde tu panel de administración.
          </p>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">¡Listo!</h1>
            <p className="text-[var(--color-text-muted)]">Ya recibimos toda la información.</p>
            {client?.business_name && (
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                Gracias {client.business_name}.
              </p>
            )}
          </div>

          <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] p-6 mb-6">
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Resumen
            </h3>
            <div className="space-y-3">
              {STEPS.map((s, i) => {
                const percentage = getStepPercentage(
                  s.key,
                  formData[s.key],
                  client?.documents
                );
                const barColor =
                  percentage >= 100
                    ? 'bg-green-500'
                    : percentage >= 40
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-yellow-500';

                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)] w-28 shrink-0">
                      {s.label}
                    </span>
                    <div className="flex-1 h-2 bg-[var(--color-bg-section)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] w-8 text-right">
                      {percentage}%
                    </span>
                    <button
                      onClick={() => editStep(i)}
                      className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors shrink-0"
                      title={`Editar ${s.label}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Esta información está siendo revisada por AppResuelve
          </p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-[var(--color-primary)]" size={32} />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
            {client?.business_name ? `¡Hola ${client.business_name}!` : 'Bienvenido al formulario de tu futura app'}
          </h1>
          <p className="text-[var(--color-text-muted)] leading-relaxed mb-8">
            Antes de comenzar tené en cuenta que no es obligatorio completar
            todo. Pero mientras más completes, más rápido y acertado será el
            resultado de tu sitio web.
          </p>
          <button
            onClick={acceptIntro}
            className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors text-base font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[step].component;
  const isLastStep = step === STEPS.length - 1;

  const renderContent = () => (
    <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Datos para tu sitio
        </h2>
        <SaveIndicator status={saveStatus} />
      </div>
      {step === STEPS.length - 1 ? (
        <BrandingStep
          data={formData.branding}
          onChange={(data) => updateSection('branding', data)}
          token={hash}
        />
      ) : (
        <CurrentStepComponent
          data={formData[STEPS[step].key]}
          onChange={(data) => updateSection(STEPS[step].key, data)}
          token={hash}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] relative overflow-hidden">
      {/* Decorative blur circle */}
      <div className="fixed top-[20%] right-[-150px] w-[400px] h-[400px] rounded-full bg-[var(--color-primary)] blur-[120px] opacity-[0.06] pointer-events-none" />

      {/* ========== MOBILE: Top bar ========== */}
      <header className="md:hidden sticky top-0 z-30 bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/dfun5vbsf/image/upload/v1779926864/logo_s-f_appresuleve_250px_ccbmqf.png" alt="AppResuelve" className="h-6 w-auto" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">AppResuelve <span className="text-[var(--color-text-muted)] font-normal">Formularios</span></span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 z-30 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] shadow-lg">
              <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
                <div className="grid grid-cols-1 gap-1">
                  {STEPS.map((s, i) => (
                    <SidebarStep
                      key={s.key}
                      index={i}
                      label={s.label}
                      isCurrent={i === step}
                      isComplete={completedArray[i]}
                      isPast={i < step}
                      onClick={() => goToStep(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ========== MOBILE: Dots ========== */}
      <div className="md:hidden px-4 py-3 bg-[var(--color-bg-base)]">
        <StepIndicator
          totalSteps={STEPS.length}
          currentStep={step}
          completed={completedArray}
        />
      </div>

      {/* ========== LAYOUT ========== */}
      <div className="flex flex-col md:flex-row">
        {/* ========== DESKTOP: Sidebar ========== */}
        <aside className="hidden md:flex md:flex-col md:w-56 md:sticky md:top-0 md:h-screen md:border-r md:border-[var(--color-border)] md:bg-[var(--color-bg-card)] md:shrink-0">
          <div className="px-4 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <img src="https://res.cloudinary.com/dfun5vbsf/image/upload/v1779926864/logo_s-f_appresuleve_250px_ccbmqf.png" alt="AppResuelve" className="h-6 w-auto" />
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">AppResuelve <span className="text-[var(--color-text-muted)] font-normal">Formularios</span></span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {STEPS.map((s, i) => (
              <SidebarStep
                key={s.key}
                index={i}
                label={s.label}
                isCurrent={i === step}
                isComplete={completedArray[i]}
                isPast={i < step}
                onClick={() => goToStep(i)}
              />
            ))}
          </nav>
        </aside>

        {/* ========== Content + Footer column ========== */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-104px)] md:min-h-screen">
          <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 pt-4 md:pt-12 pb-28">
            {renderContent()}
          </main>

          <footer className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] z-30 md:left-56">
            <div className="md:max-w-2xl md:mx-auto">
              <StepFooter
                step={step}
                totalSteps={STEPS.length}
                isLastStep={isLastStep}
                onPrev={prevStep}
                onNext={nextStep}
              />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
