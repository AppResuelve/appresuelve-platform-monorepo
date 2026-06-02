import React, { useState, useEffect } from 'react';
import FileUpload from '../../shared/components/FileUpload';
import { Info } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const PRESET_COLORS = [
  { name: 'Azul', primary: '#2563eb', secondary: '#1e40af' },
  { name: 'Verde', primary: '#059669', secondary: '#047857' },
  { name: 'Violeta', primary: '#7c3aed', secondary: '#5b21b6' },
  { name: 'Rojo', primary: '#dc2626', secondary: '#991b1b' },
  { name: 'Naranja', primary: '#ea580c', secondary: '#c2410c' },
  { name: 'Rosa', primary: '#db2777', secondary: '#9d174d' },
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
  const primary = branding.primary || '#2563eb';
  const secondary = branding.secondary || '#1e40af';

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

  function applyPreset(p, s) {
    onChange({ ...branding, primary: p, secondary: s });
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

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Color primario
          </label>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="color"
              value={primary}
              onChange={(e) => update('primary', e.target.value)}
              className="w-12 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={primary}
              onChange={(e) => update('primary', e.target.value)}
              placeholder="#2563eb"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Color secundario
          </label>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="color"
              value={secondary}
              onChange={(e) => update('secondary', e.target.value)}
              className="w-12 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={secondary}
              onChange={(e) => update('secondary', e.target.value)}
              placeholder="#1e40af"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Combinaciones predefinidas
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.primary, preset.secondary)}
                className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors text-center"
              >
                <div className="flex gap-1 justify-center mb-1.5">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-xs text-slate-600">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">
            Si no estás seguro lo podemos charlar luego.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BrandingStep;
