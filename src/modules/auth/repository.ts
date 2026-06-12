import { pool } from '../../shared/config/db';

export class AuthRepository {
  public async findUserByEmail(email: string) {
    const res = await pool.query('SELECT id, name, email, phone, avatar_path, role, status, login_attempts, blocked_at, last_login, require_password_change, password_hash, created_by, created_at, updated_at FROM users WHERE email = $1 AND status != \'INACTIVE\'', [email]);
    return res.rows[0] || null;
  }

  public async findUserById(id: string) {
    const res = await pool.query('SELECT id, name, email, phone, avatar_path, role, status, login_attempts, blocked_at, last_login, require_password_change, password_hash, created_by, created_at, updated_at FROM users WHERE id = $1 AND status != \'INACTIVE\'', [id]);
    return res.rows[0] || null;
  }

  public async incrementLoginAttempts(userId: string) {
    const res = await pool.query(
      `UPDATE users SET login_attempts = COALESCE(login_attempts, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING login_attempts`,
      [userId]
    );
    return res.rows[0]?.login_attempts ?? 0;
  }

  public async resetLoginAttempts(userId: string) {
    await pool.query(
      `UPDATE users SET login_attempts = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [userId]
    );
  }

  public async blockUser(userId: string) {
    await pool.query(
      `UPDATE users SET status = 'BLOCKED', blocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [userId]
    );
  }

  public async unblockUser(userId: string) {
    await pool.query(
      `UPDATE users SET status = 'ACTIVE', login_attempts = 0, blocked_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [userId]
    );
  }

  // ── Refresh Token Methods ──────────────────────────────────────────

  public async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    const res = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id`,
      [userId, tokenHash, expiresAt]
    );
    return res.rows[0]?.id;
  }

  public async findRefreshTokenByHash(tokenHash: string) {
    const res = await pool.query(
      `SELECT id, user_id, token_hash, expires_at, revoked, created_at FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );
    return res.rows[0] || null;
  }

  public async revokeRefreshToken(tokenHash: string) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`,
      [tokenHash]
    );
  }

  public async revokeAllUserRefreshTokens(userId: string) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE`,
      [userId]
    );
  }

  public async saveResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  }

  public async cleanupExpiredRefreshTokens(daysOld: number = 30) {
    const res = await pool.query(
      `DELETE FROM refresh_tokens WHERE expires_at < NOW() - $1::interval OR (revoked = TRUE AND created_at < NOW() - $2::interval)`,
      [`${daysOld} days`, `${daysOld} days`]
    );
    return res.rowCount ?? 0;
  }
}
