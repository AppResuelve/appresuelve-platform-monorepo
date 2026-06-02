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
} from 'lucide-react';
import { getClientByToken, saveOnboardingData } from '@appresuelve/shared';
import StepIndicator from '../components/StepIndicator';
import HeroStep from '../components/HeroStep';
import ServicesStep from '../components/ServicesStep';
import ProductsStep from '../components/ProductsStep';
import FaqStep from '../components/FaqStep';
import SocialLinksStep from '../components/SocialLinksStep';
import BrandingStep from '../components/BrandingStep';
import SaveIndicator from '../../shared/components/SaveIndicator';

const STEPS = [
  { key: 'hero', label: 'Hero', component: HeroStep },
  { key: 'services', label: 'Servicios', component: ServicesStep },
  { key: 'products', label: 'Productos', component: ProductsStep },
  { key: 'faq', label: 'FAQ', component: FaqStep },
  { key: 'socialLinks', label: 'Redes Sociales', component: SocialLinksStep },
  { key: 'branding', label: 'Branding', component: BrandingStep },
];

const INITIAL_DATA = {
  hero: {},
  services: [],
  products: {},
  faq: [],
  socialLinks: {},
  branding: {},
};

function isSectionComplete(sectionData) {
  if (!sectionData) return false;
  if (Array.isArray(sectionData)) return sectionData.length > 0;
  return Object.keys(sectionData).length > 0;
}

function OnboardingPage() {
  const { hash } = useParams();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [completed, setCompleted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    async function load() {
      try {
        const clientData = await getClientByToken(hash);
        setClient(clientData);

        if (clientData.form_data && Object.keys(clientData.form_data).length > 0) {
          const saved = { ...clientData.form_data };

          if (saved.colors) {
            saved.branding = { ...(saved.branding || {}), ...saved.colors };
            delete saved.colors;
          }

          const savedStep = saved.current_step;
          delete saved.current_step;

          const merged = { ...INITIAL_DATA, ...saved };
          setFormData(merged);

          if (savedStep !== undefined && savedStep >= 0 && savedStep < STEPS.length) {
            setStep(savedStep);
          }
        }

        if (clientData.status === 'completed') {
          setCompleted(true);
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
        const dataWithStep = { ...data, current_step: step };
        await saveOnboardingData(hash, dataWithStep);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    },
    [hash, step]
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

  function flushAndGo(targetStep) {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      save(formDataRef.current);
    }
    if (targetStep >= 0 && targetStep < STEPS.length) {
      setStep(targetStep);
    } else {
      setCompleted(true);
    }
    setMenuOpen(false);
  }

  function nextStep() {
    flushAndGo(step < STEPS.length - 1 ? step + 1 : -1);
  }

  function prevStep() {
    flushAndGo(step - 1);
  }

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

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">¡Listo!</h1>
          <p className="text-slate-500 mb-1">Ya recibimos toda la información.</p>
          <p className="text-slate-400 text-sm">
            {client?.business_name
              ? `Gracias ${client.business_name}, en breve nos pondremos en contacto.`
              : 'En breve nos pondremos en contacto con vos.'}
          </p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[step].component;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-bold text-slate-800">Onboarding</h1>
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
                  {STEPS.map((s, i) => {
                    const complete = isSectionComplete(formData[s.key]);
                    const isCurrent = i === step;
                    return (
                      <button
                        key={s.key}
                        onClick={() => flushAndGo(i)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                          isCurrent
                            ? 'bg-blue-50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                            complete
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {complete ? <Check size={14} /> : i + 1}
                        </div>
                        <span
                          className={`text-sm ${
                            isCurrent
                              ? 'text-blue-700 font-medium'
                              : complete
                              ? 'text-green-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <div className="px-4 py-3 bg-slate-50">
        <StepIndicator
          steps={STEPS.map((s) => ({ key: s.key }))}
          currentStep={step}
          formData={formData}
        />
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-24">
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
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <span className="text-xs text-slate-400 font-medium">
            {step + 1} / {STEPS.length}
          </span>

          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {isLastStep ? (
              <>
                <CheckCircle size={16} />
                Finalizar
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Siguiente</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default OnboardingPage;
