import React from 'react';
import { Check } from 'lucide-react';

function isComplete(sectionData) {
  if (!sectionData) return false;
  if (Array.isArray(sectionData)) return sectionData.length > 0;
  return Object.keys(sectionData).length > 0;
}

function StepIndicator({ steps, currentStep, formData }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {steps.map((step, index) => {
        const complete = isComplete(formData[step.key]);
        const isCurrent = index === currentStep;
        const isPast = index < currentStep;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                complete || isPast
                  ? 'bg-green-500 text-white'
                  : isCurrent
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {complete || isPast ? <Check size={12} /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 transition-colors ${
                  index < currentStep || complete ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StepIndicator;
