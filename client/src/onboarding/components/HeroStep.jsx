import React from 'react';
import { Image } from 'lucide-react';

function HeroStep({ data, onChange }) {
  const hero = data || {};

  function update(key, value) {
    onChange({ ...hero, [key]: value });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Título principal</label>
        <input
          type="text"
          value={hero.headline || ''}
          onChange={(e) => update('headline', e.target.value)}
          placeholder="Ej: Transformá tu negocio con una web profesional"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        />
        <p className="text-xs text-slate-400 mt-1">El primer texto que ven tus clientes</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo</label>
        <textarea
          value={hero.subheadline || ''}
          onChange={(e) => update('subheadline', e.target.value)}
          placeholder="Ej: Diseñamos sitios web modernos que convierten visitas en clientes"
          rows={3}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Texto del botón (CTA)</label>
        <input
          type="text"
          value={hero.ctaText || ''}
          onChange={(e) => update('ctaText', e.target.value)}
          placeholder="Ej: Contactanos ahora"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Imagen de fondo</label>
        <div className="flex items-center gap-3">
          <input
            type="url"
            value={hero.backgroundImage || ''}
            onChange={(e) => update('backgroundImage', e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
          {hero.backgroundImage && (
            <img
              src={hero.backgroundImage}
              alt="Preview"
              className="w-12 h-12 object-cover rounded border"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">URL de la imagen de fondo del hero</p>
      </div>
    </div>
  );
}

export default HeroStep;
