import { apiClient } from './api';
import { User } from '@/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  cnpj?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  static async refreshTokens(refreshToken: string): Promise<RefreshResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  static async getProfile(): Promise<{ user: User }> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  static async updateProfile(data: Partial<Pick<User, 'name' | 'companyName' | 'cnpj'>>): Promise<{ user: User }> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  static async logout(): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
}