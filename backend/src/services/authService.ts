import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  cnpj?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-256-bits';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-256-bits';
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  async register(data: RegisterData): Promise<{ user: Omit<User, 'passwordHash'>, tokens: TokenPair }> {
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Usuário já existe com este email');
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        companyName: data.companyName,
        cnpj: data.cnpj,
        passwordHash,
        planType: 'starter', // Plano inicial
        taxRegime: 'simples_nacional' // Regime padrão
      }
    });

    // Criar configurações iniciais do usuário
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        taxSettings: {
          regime: 'simples_nacional',
          aliquota: 15.5
        },
        notificationPreferences: {
          emailOnSale: true,
          pushOnCsvImport: true,
          weeklyReport: false,
          alertHighSpending: true,
          reminderDasPayment: true
        },
        integrationsConfig: {}
      }
    });

    // Gerar tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Retornar usuário sem senha
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens
    };
  }

  async login(credentials: LoginCredentials): Promise<{ user: Omit<User, 'passwordHash'>, tokens: TokenPair }> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    // Gerar tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Retornar usuário sem senha
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string, email: string };

      // Verificar se usuário ainda existe
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gerar novos tokens
      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  async getUserProfile(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true
      }
    });

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'name' | 'companyName' | 'cnpj'>>): Promise<Omit<User, 'passwordHash'>> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });
  }

  private generateTokens(userId: string, email: string): TokenPair {
    const payload = { userId, email };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): { userId: string, email: string } {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { userId: string, email: string };
    } catch (error) {
      throw new Error('Token de acesso inválido');
    }
  }
}