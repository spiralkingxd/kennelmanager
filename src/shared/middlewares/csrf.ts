import { Request, Response, NextFunction } from 'express';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Parse a named cookie from the Cookie header without cookie-parser dependency.
 */
function getCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match?.[1];
}

/**
 * CSRF Double-Submit Cookie Pattern Middleware
 *
 * Validates that the X-CSRF-Token header matches the csrf-token cookie.
 * This prevents CSRF attacks because an attacker's site cannot read
 * the victim's cookies from the target domain (same-origin policy).
 *
 * Flow:
 *   1. Login sets csrf-token cookie (httpOnly: false, readable by JS)
 *   2. Frontend reads cookie via document.cookie
 *   3. Frontend sends value as X-CSRF-Token header on mutating requests
 *   4. This middleware compares header vs cookie — rejects if mismatch
 *
 * Skip conditions:
 *   - GET, HEAD, OPTIONS (safe methods, no side effects)
 *   - Routes starting with /auth/ (login sets the cookie, refresh uses body token)
 */
export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  // Safe methods have no side effects — CSRF not applicable
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'] as string | undefined;
  const cookieToken = getCookie(req, 'csrf-token');

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token inválido.',
      code: 'CSRF_INVALID',
    });
  }

  next();
}
