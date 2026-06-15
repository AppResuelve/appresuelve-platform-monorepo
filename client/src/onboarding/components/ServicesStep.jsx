import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const DEFAULT_SERVICE = { name: '', description: '', price: '' };

function ServicesStep({ data, onChange }) {
  const services = data || [];

  function add() {
    onChange([...services, { ...DEFAULT_SERVICE }]);
  }

  function remove(index) {
    onChange(services.filter((_, i) => i !== index));
  }

  function update(index, field, value) {
    const updated = services.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <div key={index} className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">Servicio {index + 1}</span>
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
              value={service.name}
              onChange={(e) => update(index, 'name', e.target.value)}
              placeholder="Nombre del servicio"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <textarea
              value={service.description}
              onChange={(e) => update(index, 'description', e.target.value)}
              placeholder="Descripción breve"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            <div>
              <input
                type="text"
                value={service.price || ''}
                onChange={(e) => update(index, 'price', e.target.value)}
                placeholder="Precio"
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Agregar servicio
      </button>

      {services.length === 0 && (
        <p className="text-center text-slate-400 text-sm py-4">
          Agregá los servicios que ofrecés
        </p>
      )}
    </div>
  );
}

export default ServicesStep;
