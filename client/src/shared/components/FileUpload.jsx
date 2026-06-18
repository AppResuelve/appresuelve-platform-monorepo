import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function uploadFile(token, file, documentType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const res = await fetch(`${API_BASE}/documents/${token}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

async function deleteFile(token, documentId) {
  const res = await fetch(`${API_BASE}/documents/${token}/${documentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

function FileUpload({ token, documentType, files, onChange, accept }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFiles(selectedFiles) {
    setUploading(true);
    try {
      const results = [];
      for (const file of selectedFiles) {
        const doc = await uploadFile(token, file, documentType);
        results.push(doc);
      }
      onChange([...files, ...results]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleDelete(doc) {
    try {
      await deleteFile(token, doc.id);
      onChange(files.filter(f => f.id !== doc.id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  const isImage = (mime) => mime && mime.startsWith('image/');

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
            <Loader2 className="animate-spin" size={32} />
            <span>Subiendo...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
            <Upload size={32} />
            <span className="font-medium">Arrastrá archivos o hacé click</span>
            <span className="text-sm">{accept ? accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase() : 'PNG, JPG, PDF'} hasta 50MB</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={accept || 'image/*,.pdf'}
          onChange={(e) => {
            if (e.target.files.length) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg"
            >
              {isImage(file.mime_type) ? (
                <img
                  src={file.file_url}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-[var(--color-bg-section)] rounded flex items-center justify-center">
                  <File size={20} className="text-[var(--color-text-muted)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{file.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {file.file_size ? `${(file.file_size / 1024).toFixed(0)} KB` : ''}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
