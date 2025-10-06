const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export const apiUrl = (path = '') => {
  const p = String(path).startsWith('/') ? path : `/${path}`;
  // If BASE_URL is empty (dev), return relative /api
  if (!BASE_URL) return `/api${p}`;
  return `${BASE_URL}/api${p}`;
};

export const apiFetch = (path, options = {}) => {
  const url = apiUrl(path);
  return fetch(url, options);
};
