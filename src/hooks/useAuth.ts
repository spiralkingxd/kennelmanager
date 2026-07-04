import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../shared/utils/apiFetch';

const USER_KEY = 'dogsperez_user';

interface AuthUser {
  id: string;
  username: string;
  role: string;
  name?: string;
}

/**
 * HIGH-001: The access token lives in an httpOnly cookie set by the server and
 * is therefore inaccessible to JavaScript. We can only rely on the presence of
 * a client-readable "session marker" (the non-httpOnly CSRF cookie would also
 * work, but we deliberately don't read it here). The simplest source of truth
 * is `localStorage` containing only the **public profile** (id, name, role) of
 * the authenticated user. Token presence/expiry is validated server-side on
 * every authenticated request, so a stale client-side entry cannot grant access.
 */
function hasStoredUser(): boolean {
  return !!localStorage.getItem(USER_KEY);
}

function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
}

// HIGH-001: There is no way for JS to clear the httpOnly access-token cookie,
// so logout MUST call the /auth/logout endpoint, which clears it server-side.
async function logoutViaApi(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // Best-effort: ignore network errors, the redirect below still happens.
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount. The actual auth check happens
  // server-side on the next request; if the cookie is missing/expired, the API
  // returns 401 and apiFetch will redirect to login.
  useEffect(() => {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch {
        clearStoredUser();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((_token: string, userData: AuthUser, _refreshToken?: string, _rememberMe?: boolean) => {
    // HIGH-001: Tokens are stored in httpOnly cookies by the server; the client
    // only persists the **public user profile** for UI rendering.
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    // HIGH-001: cannot clear the httpOnly access-token cookie from JS — the
    // server-side /auth/logout endpoint is the only place that can do it.
    void logoutViaApi();
    clearStoredUser();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, user, isLoading, login, logout, hasStoredUser };
}