// Central backend configuration for frontend
const getBackendUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  const raw = import.meta.env.VITE_BACKEND_URL || 'https://redcross-backend-gev6.onrender.com';
  return raw.replace(/\/+$/, '');
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE = `${BACKEND_URL}/api/v1`;
