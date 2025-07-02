import { User } from '@/types';

// Mock API para demonstração quando backend não estiver disponível
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Usuário mock para demonstração
const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'test@financeinfo.com',
  company: 'Marketing Digital Pro',
  cnpj: '12.345.678/0001-90'
};

// Mock tokens
const mockTokens = {
  accessToken: 'mock-access-token-123456789',
  refreshToken: 'mock-refresh-token-987654321'
};

export class AuthMockAPI {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validação flexível para demo - aceita qualquer email e senha válidos
    if (credentials.email && credentials.email.includes('@') && credentials.password && credentials.password.length >= 3) {
      return {
        user: { ...mockUser, email: credentials.email },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken
      };
    }

    throw new Error('Credenciais inválidas');
  }

  static async register(data: any): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      user: {
        ...mockUser,
        email: data.email,
        name: data.name,
        company: data.companyName || 'Empresa Teste'
      },
      accessToken: mockTokens.accessToken,
      refreshToken: mockTokens.refreshToken
    };
  }

  static async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (refreshToken === mockTokens.refreshToken) {
      return {
        accessToken: 'new-mock-access-token-' + Date.now(),
        refreshToken: 'new-mock-refresh-token-' + Date.now()
      };
    }

    throw new Error('Refresh token inválido');
  }

  static async getProfile(): Promise<{ user: User }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { user: mockUser };
  }

  static async updateProfile(data: any): Promise<{ user: User }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { user: { ...mockUser, ...data } };
  }

  static async changePassword(): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Senha alterada com sucesso' };
  }

  static async logout(): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { message: 'Logout realizado com sucesso' };
  }
}