const TOKEN_COOKIE = 'kennelmanager_token';
const REFRESH_TOKEN_COOKIE = 'kennelmanager_refresh_token';
const USER_KEY = 'kennelmanager_user';
const API_PREFIX = '/api/v1';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function clearSessionCookies() {
  document.cookie = `${TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  document.cookie = `csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

const MUTATING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getCookie(TOKEN_COOKIE);
  const csrfToken = getCookie('csrf-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // SEG-002: Add CSRF token to mutating requests
  if (MUTATING_METHODS.includes((options.method || 'GET').toUpperCase()) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(`${API_PREFIX}${url}`, { ...options, headers, credentials: 'include' });

  if (!res.ok) {
    // 401 — token expirado ou inválido: limpa sessão e redireciona
    if (res.status === 401) {
      clearSessionCookies();
      localStorage.removeItem(USER_KEY);
      window.location.href = '/';
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    // SEG-002: 403 — CSRF token inválido: limpa sessão e redireciona
    if (res.status === 403) {
      clearSessionCookies();
      localStorage.removeItem(USER_KEY);
      window.location.href = '/';
      throw new Error('Sessão inválida. Faça login novamente.');
    }
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}