import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'hero', label: 'Hero' },
  { key: 'services', label: 'Servicios' },
  { key: 'products', label: 'Productos' },
  { key: 'faq', label: 'FAQ' },
  { key: 'socialLinks', label: 'Redes' },
  { key: 'branding', label: 'Branding' },
];

function isComplete(sectionData) {
  if (!sectionData) return false;
  if (Array.isArray(sectionData)) return sectionData.length > 0;
  return Object.keys(sectionData).length > 0;
}

function StepIndicator({ currentStep, formData }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, index) => {
        const complete = isComplete(formData[step.key]);
        const isCurrent = index === currentStep;
        const isPast = index < currentStep;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  complete || isPast
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {complete || isPast ? <Check size={18} /> : index + 1}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  isCurrent ? 'text-blue-600' : complete || isPast ? 'text-green-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-8 md:w-16 h-0.5 mx-1 mt-[-16px] transition-colors ${
                  index < currentStep || complete ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;
