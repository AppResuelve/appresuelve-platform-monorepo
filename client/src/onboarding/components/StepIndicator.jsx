import React from 'react';
import { Check } from 'lucide-react';

function StepIndicator({ totalSteps, currentStep, completed }) {
  const dots = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1">
      {dots.map((index) => {
        const complete = completed[index];
        const isCurrent = index === currentStep;
        const isPast = index < currentStep;

        return (
          <React.Fragment key={index}>
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
            {index < totalSteps - 1 && (
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
