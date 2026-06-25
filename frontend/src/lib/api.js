const rawBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

/** Empty in dev (Vite proxy); set to deployed backend URL in production. */
export const API_BASE_URL = rawBase

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}
