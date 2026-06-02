import React, { useState, useEffect } from 'react';
import FileUpload from '../../shared/components/FileUpload';
import { FileText, Image } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchDocuments(token) {
  const res = await fetch(`${API_BASE}/documents/${token}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

function ProductsStep({ data, onChange, token }) {
  const [catalogFiles, setCatalogFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchDocuments(token)
      .then((docs) => {
        setCatalogFiles(
          docs.filter((d) => d.document_type === 'product_files')
        );
        setImageFiles(
          docs.filter((d) => d.document_type === 'product_images')
        );
      })
      .catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={18} className="text-slate-400" />
          <label className="text-sm font-medium text-slate-700">
            Catálogo / Lista de productos
          </label>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Excel, PDF o Word con tu lista de productos y precios
        </p>
        <FileUpload
          token={token}
          documentType="product_files"
          files={catalogFiles}
          onChange={setCatalogFiles}
          accept=".xlsx,.xls,.docx,.doc,.pdf"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Image size={18} className="text-slate-400" />
          <label className="text-sm font-medium text-slate-700">
            Imágenes de productos
          </label>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Fotos de tus productos. Mientras más, mejor.
        </p>
        <FileUpload
          token={token}
          documentType="product_images"
          files={imageFiles}
          onChange={setImageFiles}
        />
      </div>
    </div>
  );
}

export default ProductsStep;
