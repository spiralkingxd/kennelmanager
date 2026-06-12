import { useState, useEffect, useCallback } from 'react';

const TOKEN_COOKIE = 'kennelmanager_token';
const REFRESH_TOKEN_COOKIE = 'kennelmanager_refresh_token';
const USER_KEY = 'kennelmanager_user';
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function clearSessionCookies() {
  document.cookie = `${TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  document.cookie = `csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from cookie on mount (com validação de expiração)
  useEffect(() => {
    const token = getCookie(TOKEN_COOKIE);
    const userData = localStorage.getItem(USER_KEY);
    if (token && userData) {
      try {
        if (isTokenExpired(token)) {
          clearSessionCookies();
          localStorage.removeItem(USER_KEY);
        } else {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch {
        clearSessionCookies();
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: AuthUser, refreshToken?: string, rememberMe?: boolean) => {
    // Tokens são armazenados em httpOnly cookies pelo servidor, não em localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearSessionCookies();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Periodic token expiry check (a cada 5 minutos)
  useEffect(() => {
    const checkToken = () => {
      const token = getCookie(TOKEN_COOKIE);
      if (token && isTokenExpired(token)) {
        logout();
      }
    };

    const interval = setInterval(checkToken, TOKEN_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [logout]);

  return { isAuthenticated, user, isLoading, login, logout };
}