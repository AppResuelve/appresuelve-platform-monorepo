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
