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

export const apiAuthFetch = (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch(path, { ...options, headers });
};

export const uploadFiles = async (path, files, extra = {}) => {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
  const res = await apiAuthFetch(path, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};
