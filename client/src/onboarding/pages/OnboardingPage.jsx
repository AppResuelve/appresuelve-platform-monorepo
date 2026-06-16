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
        isCurrent ? 'bg-blue-50' : 'hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
          isComplete
            ? 'bg-green-500 text-white'
            : isCurrent
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-400'
        }`}
      >
        {isComplete ? <Check size={14} /> : index + 1}
      </div>
      <span
        className={`text-sm ${
          isCurrent
            ? 'text-blue-700 font-medium'
            : isComplete
            ? 'text-green-700'
            : 'text-slate-500'
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
        className="flex items-center gap-1.5 px-3 py-2.5 text-base text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <span className="text-sm text-slate-400 font-medium">
        {step + 1} / {totalSteps}
      </span>

      <button
        onClick={onNext}
        className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium"
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

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    async function load() {
      try {
        const clientData = await getClientByToken(hash);
        setClient(clientData);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Link inválido</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">¡Listo!</h1>
            <p className="text-slate-500">Ya recibimos toda la información.</p>
            {client?.business_name && (
              <p className="text-slate-400 text-sm mt-1">
                Gracias {client.business_name}.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
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
                    ? 'bg-blue-500'
                    : 'bg-yellow-500';

                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 w-28 shrink-0">
                      {s.label}
                    </span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">
                      {percentage}%
                    </span>
                    <button
                      onClick={() => editStep(i)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                      title={`Editar ${s.label}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400">
            Esta información está siendo revisada por AppResuelve
          </p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-blue-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-4">
            {client?.business_name ? `¡Hola ${client.business_name}!` : 'Bienvenido al formulario de tu futura app'}
          </h1>
          <p className="text-slate-500 leading-relaxed mb-8">
            Antes de comenzar tené en cuenta que no es obligatorio completar
            todo. Pero mientras más completes, más rápido y acertado será el
            resultado de tu sitio web.
          </p>
          <button
            onClick={acceptIntro}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium"
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-4">
        {STEPS[step].label}
      </h2>
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
    <div className="min-h-screen bg-slate-50">
      {/* ========== MOBILE: Top bar ========== */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-bold text-slate-800">
            Datos de tu app
          </h1>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 z-30 bg-white border-b border-slate-200 shadow-lg">
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
      <div className="md:hidden px-4 py-3 bg-slate-50">
        <StepIndicator
          totalSteps={STEPS.length}
          currentStep={step}
          completed={completedArray}
        />
      </div>

      {/* ========== LAYOUT ========== */}
      <div className="flex flex-col md:flex-row">
        {/* ========== DESKTOP: Sidebar ========== */}
        <aside className="hidden md:flex md:flex-col md:w-56 md:sticky md:top-0 md:h-screen md:border-r md:border-slate-200 md:bg-white md:shrink-0">
          <div className="px-4 py-4 border-b border-slate-100">
            <h1 className="text-base font-bold text-slate-800 mb-1">
              Datos de tu app
            </h1>
            <SaveIndicator status={saveStatus} />
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

          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 md:left-56">
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
