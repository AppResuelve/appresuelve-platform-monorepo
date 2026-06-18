import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const DEFAULT_FAQ = { question: '', answer: '' };

function FaqStep({ data, onChange }) {
  const faqs = data || [];

  function add() {
    onChange([...faqs, { ...DEFAULT_FAQ }]);
  }

  function remove(index) {
    onChange(faqs.filter((_, i) => i !== index));
  }

  function update(index, field, value) {
    const updated = faqs.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    );
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Pregunta {index + 1}</span>
            <button
              onClick={() => remove(index)}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={faq.question}
              onChange={(e) => update(index, 'question', e.target.value)}
              placeholder="¿Qué pregunta frecuente querés responder?"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-[var(--color-bg-card)]"
            />
            <textarea
              value={faq.answer}
              onChange={(e) => update(index, 'answer', e.target.value)}
              placeholder="Respuesta..."
              rows={2}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-[var(--color-bg-card)] resize-none"
            />
          </div>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full py-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Agregar pregunta
      </button>

      {faqs.length === 0 && (
        <p className="text-center text-[var(--color-text-muted)] text-sm py-4">
          Agregá preguntas frecuentes para tus clientes
        </p>
      )}
    </div>
  );
}

export default FaqStep;
