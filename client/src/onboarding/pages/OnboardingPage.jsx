import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { getClientByToken, getOnboardingData, saveOnboardingData } from '@appresuelve/shared';
import StepIndicator from '../components/StepIndicator';
import HeroStep from '../components/HeroStep';
import ServicesStep from '../components/ServicesStep';
import FaqStep from '../components/FaqStep';
import ColorsStep from '../components/ColorsStep';
import SocialLinksStep from '../components/SocialLinksStep';
import BrandingStep from '../components/BrandingStep';
import SaveIndicator from '../../shared/components/SaveIndicator';

const STEPS = [
  { key: 'hero', label: 'Hero', component: HeroStep },
  { key: 'services', label: 'Servicios', component: ServicesStep },
  { key: 'faq', label: 'FAQ', component: FaqStep },
  { key: 'colors', label: 'Colores', component: ColorsStep },
  { key: 'socialLinks', label: 'Redes Sociales', component: SocialLinksStep },
  { key: 'branding', label: 'Branding', component: BrandingStep },
];

const INITIAL_DATA = {
  hero: {},
  services: [],
  faq: [],
  colors: {},
  socialLinks: {},
  branding: {},
};

function OnboardingPage() {
  const { hash } = useParams();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [completed, setCompleted] = useState(false);

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    async function load() {
      try {
        const clientData = await getClientByToken(hash);
        setClient(clientData);

        if (clientData.form_data && Object.keys(clientData.form_data).length > 0) {
          const merged = { ...INITIAL_DATA, ...clientData.form_data };
          setFormData(merged);
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

  const save = useCallback(async (data) => {
    setSaveStatus('saving');
    try {
      await saveOnboardingData(hash, data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [hash]);

  function triggerSave(data) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => save(data), 2000);
  }

  function updateSection(section, data) {
    setFormData(prev => {
      const next = { ...prev, [section]: data };
      triggerSave(next);
      return next;
    });
  }

  function nextStep() {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      save(formDataRef.current);
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  }

  function prevStep() {
    if (step > 0) setStep(step - 1);
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Onboarding</h1>
          <SaveIndicator status={saveStatus} />
        </div>

        <StepIndicator currentStep={step} formData={formData} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
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

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={18} />
              Anterior
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                Paso {step + 1} de {STEPS.length}
              </span>
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle size={18} />
                    Finalizar
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Los cambios se guardan automáticamente. Podés volver en cualquier momento.
        </p>
      </div>
    </div>
  );
}

export default OnboardingPage;
