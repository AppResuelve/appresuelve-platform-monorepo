import React, { useState, useEffect } from 'react';
import FileUpload from '../../shared/components/FileUpload';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const PRESET_COLORS = [
  { name: 'Azul',     primary: '#2563eb', secondary: '#1d4ed8', accent: '#f59e0b' },
  { name: 'Verde',    primary: '#10b981', secondary: '#059669', accent: '#f97316' },
  { name: 'Violeta',  primary: '#7c3aed', secondary: '#6d28d9', accent: '#f43f5e' },
  { name: 'Rojo',     primary: '#dc2626', secondary: '#b91c1c', accent: '#fbbf24' },
  { name: 'Naranja',  primary: '#f97316', secondary: '#ea580c', accent: '#06b6d4' },
  { name: 'Cian',     primary: '#06b6d4', secondary: '#0891b2', accent: '#8b5cf6' },
  { name: 'Rosa',     primary: '#ec4899', secondary: '#be185d', accent: '#6366f1' },
  { name: 'Gris',     primary: '#4b5563', secondary: '#1f2937', accent: '#eab308' },
];

async function fetchDocuments(token) {
  const res = await fetch(`${API_BASE}/documents/${token}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

function BrandingStep({ data, onChange, token }) {
  const [logoFiles, setLogoFiles] = useState([]);
  const [faviconFiles, setFaviconFiles] = useState([]);
  const branding = data || {};
  const colors = branding.colors || null;

  useEffect(() => {
    fetchDocuments(token)
      .then((docs) => {
        setLogoFiles(docs.filter((d) => d.document_type === 'logo'));
        setFaviconFiles(docs.filter((d) => d.document_type === 'favicon'));
      })
      .catch(() => {});
  }, [token]);

  function update(key, value) {
    onChange({ ...branding, [key]: value });
  }

  function applyPreset(p, s, a) {
    onChange({ ...branding, colors: { primary: p, secondary: s, accent: a } });
  }

  function clearColors() {
    onChange({ ...branding, colors: null });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del negocio
        </label>
        <input
          type="text"
          value={branding.businessName || ''}
          onChange={(e) => update('businessName', e.target.value)}
          placeholder="Ej: Panadería El Trigo"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Descripción del negocio
        </label>
        <textarea
          value={branding.description || ''}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Contanos brevemente sobre tu negocio, qué hacés, hace cuánto..."
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none"
        />
      </div>

      <div className="border-t border-slate-100 pt-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Logo
        </label>
        <FileUpload
          token={token}
          documentType="logo"
          files={logoFiles}
          onChange={setLogoFiles}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Favicon
        </label>
        <p className="text-xs text-slate-400 mb-3">
          Opcional, pero si lo tenés, mejor. Aparece en la pestaña del navegador.
        </p>
        <FileUpload
          token={token}
          documentType="favicon"
          files={faviconFiles}
          onChange={setFaviconFiles}
        />
      </div>

      <div className="border-t border-slate-100 pt-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Colores
        </label>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {PRESET_COLORS.map((preset) => {
            const isSelected = colors?.primary === preset.primary && colors?.secondary === preset.secondary;
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.primary, preset.secondary, preset.accent)}
                className={`p-3 rounded-lg border transition-colors text-center ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex gap-1.5 justify-center mb-1.5">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-xs text-slate-600">{preset.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={clearColors}
          className={`w-full p-3 rounded-lg border text-sm text-slate-500 hover:bg-slate-50 transition-colors ${
            !colors ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' : 'border-dashed border-slate-300'
          }`}
        >
          No estoy seguro, lo charlamos después
        </button>
      </div>
    </div>
  );
}

export default BrandingStep;
