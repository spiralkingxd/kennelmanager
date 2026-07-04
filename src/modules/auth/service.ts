import crypto from 'crypto';
import { AuthRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from 'process';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private generateAccessToken(user: { id: string; role: string; username: string; name: string }): string {
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET não configurado.', 500, true, 'JWT_CONFIG_ERROR');
    }
    return jwt.sign(
      { id: user.id, role: user.role, username: user.username, name: user.name },
      jwtSecret,
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
    const token = crypto.randomBytes(40).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    // Refresh token expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { token, hash, expiresAt };
  }

  public async login(username: string, passwordString: string) {
    const user = await this.authRepository.findUserByUsername(username);

    if (!user) {
      throw new AppError('Credenciais inválidas', 401, true, 'INVALID_CREDENTIALS');
    }

    // Check if account is blocked
    if (user.status === 'BLOCKED') {
      const lockoutDuration = parseInt(env.AUTH_LOCKOUT_DURATION_MINUTES || '15', 10);
      if (user.blocked_at) {
        const blockedSince = new Date(user.blocked_at).getTime();
        const elapsedMinutes = (Date.now() - blockedSince) / 60000;
        if (elapsedMinutes < lockoutDuration) {
          throw new AppError('Conta bloqueada por excesso de tentativas.', 423, true, 'ACCOUNT_BLOCKED');
        }
        await this.authRepository.unblockUser(user.id);
      } else {
        throw new AppError('Conta bloqueada por excesso de tentativas.', 423, true, 'ACCOUNT_BLOCKED');
      }
    }

    const isPasswordValid = await bcrypt.compare(passwordString, user.password_hash);

    if (!isPasswordValid) {
      // Increment login attempts and block if threshold reached
      const attempts = await this.authRepository.incrementLoginAttempts(user.id);
      if (attempts >= 5) {
        // HIGH-004: an ADMIN account must also be protected against brute-force
        // attacks. The previous exemption only shielded the admin from the
        // consequences of an attacker who already knew the password, but it
        // also rewarded attackers who tried random credentials on the admin
        // account indefinitely. Now ALL accounts (including ADMIN) are blocked
        // after 5 consecutive failed attempts.
        await this.authRepository.blockUser(user.id);
        throw new AppError('Conta bloqueada por excesso de tentativas.', 423, true, 'ACCOUNT_BLOCKED');
      }
      throw new AppError('Credenciais inválidas', 401, true, 'INVALID_CREDENTIALS');
    }

    // Reset login attempts on successful login
    await this.authRepository.resetLoginAttempts(user.id);

    // Generate access token (15m) and refresh token (7d)
    const token = this.generateAccessToken(user);
    const refreshTokenData = this.generateRefreshToken();

    // Persist refresh token hash
    await this.authRepository.createRefreshToken(user.id, refreshTokenData.hash, refreshTokenData.expiresAt);

    return {
      token,
      refreshToken: refreshTokenData.token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    };
  }

  public async refresh(refreshTokenString: string) {
    const hash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    const storedToken = await this.authRepository.findRefreshTokenByHash(hash);
    if (!storedToken) {
      throw new AppError('Refresh token inválido ou expirado.', 401, true, 'INVALID_REFRESH_TOKEN');
    }

    // Revoke the old refresh token (rotation)
    await this.authRepository.revokeRefreshToken(hash);

    // Verify user still exists
    const user = await this.authRepository.findUserById(storedToken.user_id);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 401, true, 'USER_NOT_FOUND');
    }

    // Generate new tokens
    const token = this.generateAccessToken(user);
    const refreshTokenData = this.generateRefreshToken();

    // Persist new refresh token
    await this.authRepository.createRefreshToken(user.id, refreshTokenData.hash, refreshTokenData.expiresAt);

    return {
      token,
      refreshToken: refreshTokenData.token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    };
  }

  public async logout(userId: string) {
    await this.authRepository.revokeAllUserRefreshTokens(userId);
  }
}
