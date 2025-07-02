import { useAuthStore } from '@/stores/auth';
import { AuthAPI } from './auth-api';

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}

// Cliente API com interceptors para refresh token
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    const authState = useAuthStore.getState();
    return authState.tokens?.accessToken || null;
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const authState = useAuthStore.getState();
    if (!authState.tokens?.refreshToken) return null;

    try {
      const newTokens = await AuthAPI.refreshTokens(authState.tokens.refreshToken);
      authState.updateTokens(newTokens);
      return newTokens.accessToken;
    } catch (error) {
      // Refresh token inválido, fazer logout
      authState.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    let token = await this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Se token expirou, tentar refresh
      if (response.status === 401 && token) {
        const newToken = await this.refreshTokenIfNeeded();
        if (newToken) {
          // Retry com novo token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
          const retryResponse = await fetch(url, config);
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new ApiError(retryResponse.status, errorData);
          }
          
          const data = await retryResponse.json();
          return data.data || data;
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData);
      }

      const data = await response.json();
      return data.data || data; // Extrair 'data' da resposta se existir
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }

  // Métodos de conveniência
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Legacy API object para compatibilidade
export const api = {
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) => apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: unknown) => apiClient.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
};