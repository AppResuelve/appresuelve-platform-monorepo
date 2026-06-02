import React from 'react';
import { Palette } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Azul', primary: '#2563eb', secondary: '#1e40af' },
  { name: 'Verde', primary: '#059669', secondary: '#047857' },
  { name: 'Violeta', primary: '#7c3aed', secondary: '#5b21b6' },
  { name: 'Rojo', primary: '#dc2626', secondary: '#991b1b' },
  { name: 'Naranja', primary: '#ea580c', secondary: '#c2410c' },
  { name: 'Rosa', primary: '#db2777', secondary: '#9d174d' },
];

function ColorsStep({ data, onChange }) {
  const colors = data || { primary: '#2563eb', secondary: '#1e40af' };

  function update(key, value) {
    onChange({ ...colors, [key]: value });
  }

  function applyPreset(primary, secondary) {
    onChange({ primary, secondary });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Color primario</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colors.primary}
            onChange={(e) => update('primary', e.target.value)}
            className="w-12 h-10 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={colors.primary}
            onChange={(e) => update('primary', e.target.value)}
            placeholder="#2563eb"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Color secundario</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colors.secondary}
            onChange={(e) => update('secondary', e.target.value)}
            className="w-12 h-10 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={colors.secondary}
            onChange={(e) => update('secondary', e.target.value)}
            placeholder="#1e40af"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Combinaciones predefinidas</label>
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

      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }}>
        <div className="flex items-center gap-2 mb-2">
          <Palette size={16} style={{ color: colors.primary }} />
          <span className="text-sm font-medium" style={{ color: colors.primary }}>Vista previa</span>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            Botón primario
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: colors.secondary, color: colors.secondary }}
          >
            Botón secundario
          </button>
        </div>
      </div>
    </div>
  );
}

export default ColorsStep;
