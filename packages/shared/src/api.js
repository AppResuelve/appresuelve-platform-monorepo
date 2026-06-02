const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getClientByToken(token) {
  return apiFetch(`/clients/by-token/${token}`);
}

export function getOnboardingData(token) {
  return apiFetch(`/onboarding/${token}`);
}

export function saveOnboardingData(token, data) {
  return apiFetch(`/onboarding/${token}`, {
    method: 'PUT',
    body: JSON.stringify({ data })
  });
}

export async function uploadDocument(token, file, documentType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const url = `${API_BASE}/documents/${token}`;
  const res = await fetch(url, { method: 'POST', body: formData });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export function getDocuments(token) {
  return apiFetch(`/documents/${token}`);
}

export function deleteDocument(token, documentId) {
  return apiFetch(`/documents/${token}/${documentId}`, { method: 'DELETE' });
}
