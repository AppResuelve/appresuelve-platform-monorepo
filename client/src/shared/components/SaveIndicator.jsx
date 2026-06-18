import React from 'react';
import { Save, Check } from 'lucide-react';

function SaveIndicator({ status }) {
  if (status === 'idle') return null;

  if (status === 'saving') {
    return <Save size={14} className="text-[var(--color-text-muted)] animate-pulse" />;
  }

  if (status === 'saved') {
    return <Check size={14} className="text-green-600 dark:text-green-400" />;
  }

  if (status === 'error') {
    return <Save size={14} className="text-red-500" />;
  }

  return null;
}

export default SaveIndicator;
