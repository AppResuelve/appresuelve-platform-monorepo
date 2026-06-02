import React from 'react';
import { Loader2 } from 'lucide-react';

function SaveIndicator({ status }) {
  if (status === 'idle') return null;

  const config = {
    saving: { icon: Loader2, text: 'Guardando...', className: 'text-slate-500' },
    saved: { icon: null, text: 'Guardado', className: 'text-green-600' },
    error: { icon: null, text: 'Error al guardar', className: 'text-red-500' },
  };

  const { icon: Icon, text, className } = config[status] || config.idle;

  return (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      {Icon && <Icon size={14} className="animate-spin" />}
      <span>{text}</span>
    </div>
  );
}

export default SaveIndicator;
