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
        <div key={index} className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">Pregunta {index + 1}</span>
            <button
              onClick={() => remove(index)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <textarea
              value={faq.answer}
              onChange={(e) => update(index, 'answer', e.target.value)}
              placeholder="Respuesta..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Agregar pregunta
      </button>

      {faqs.length === 0 && (
        <p className="text-center text-slate-400 text-sm py-4">
          Agregá preguntas frecuentes para tus clientes
        </p>
      )}
    </div>
  );
}

export default FaqStep;
