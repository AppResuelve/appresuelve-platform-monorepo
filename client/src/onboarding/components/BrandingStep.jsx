import React, { useState, useEffect } from 'react';
import FileUpload from '../../shared/components/FileUpload';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchDocuments(token) {
  const res = await fetch(`${API_BASE}/documents/${token}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

function BrandingStep({ data, onChange, token }) {
  const [logoFiles, setLogoFiles] = useState([]);
  const branding = data || {};

  useEffect(() => {
    fetchDocuments(token)
      .then(docs => {
        const logos = docs.filter(d => d.document_type === 'logo');
        setLogoFiles(logos);
      })
      .catch(() => {});
  }, [token]);

  function update(key, value) {
    onChange({ ...branding, [key]: value });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del negocio</label>
        <input
          type="text"
          value={branding.businessName || ''}
          onChange={(e) => update('businessName', e.target.value)}
          placeholder="Ej: Panadería El Trigo"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del negocio</label>
        <textarea
          value={branding.description || ''}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Contanos brevemente sobre tu negocio, qué hacés, hace cuánto..."
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
        <FileUpload
          token={token}
          documentType="logo"
          files={logoFiles}
          onChange={setLogoFiles}
        />
      </div>
    </div>
  );
}

export default BrandingStep;
