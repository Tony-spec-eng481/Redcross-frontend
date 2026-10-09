// Central backend configuration for frontend
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'https://redcross-backend-gev6.onrender.com';

// Ensure no trailing slash
export const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');
export const API_BASE = `${BACKEND_URL}/api/v1`;
