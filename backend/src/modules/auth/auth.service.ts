import prisma from '../../config/db';
import { comparePassword, hashPassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { createAuditLog } from '../../utils/auditLog';
import type { LoginDto, AuthResponse, JwtPayload } from './auth.types';
import type { RegisterInput } from './auth.validation';

export class AuthService {
  /**
   * Register a new first-time user (admin)
   */
  async register(dto: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw Object.assign(new Error('Email is already registered'), { statusCode: 409 });
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: 'admin', // First time signup is automatically admin
        isActive: true,
        companyName: dto.companyName,
        phone: dto.phone,
        country: dto.country,
        language: dto.language,
        companySize: dto.companySize,
        primaryInterest: dto.primaryInterest,
      },
    });

    const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'user_created',
      entityType: 'user',
      entityName: user.email,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  /**
   * Authenticate a user and return tokens + user info.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error('Your account is deactivated. Contact administrator.'), {
        statusCode: 403,
      });
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Async audit log — non-blocking
    createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'user_updated', // closest to login; extend schema for login_success if needed
      entityType: 'session',
      entityName: user.email,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  /**
   * Issue new access token from valid refresh token.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
      }

      const newAccessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken: newAccessToken };
    } catch {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }
  }

  /**
   * Get the authenticated user's profile.
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }
}

export const authService = new AuthService();
