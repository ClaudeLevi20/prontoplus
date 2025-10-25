import type {
  HealthCheckResponse,
  UserResponse,
  PracticeResponse,
  ApiErrorResponse,
} from './api-types';

// Custom API Error
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Request Options
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
}

// Generic API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: T | ApiErrorResponse;

    try {
      data = isJson ? await response.json() : ((await response.text()) as any);
    } catch (error) {
      throw new ApiError(
        response.status,
        `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      throw new ApiError(
        response.status,
        errorData.message || `HTTP Error: ${response.statusText}`,
        errorData.error
      );
    }

    return data as T;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, requiresAuth = false, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);

    // Prepare headers
    const headers = new Headers(fetchOptions.headers);
    
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        0,
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  private getAuthToken(): string | null {
    // TODO: Implement token retrieval from localStorage or cookie
    return null;
  }

  // Typed API methods
  health = {
    check: (): Promise<HealthCheckResponse> => 
      this.get<HealthCheckResponse>('/health'),
  };

  users = {
    getAll: (): Promise<UserResponse[]> => 
      this.get<UserResponse[]>('/users', { requiresAuth: true }),
    
    getById: (id: string): Promise<UserResponse> => 
      this.get<UserResponse>(`/users/${id}`, { requiresAuth: true }),
    
    create: (data: Partial<UserResponse>): Promise<UserResponse> => 
      this.post<UserResponse>('/users', data, { requiresAuth: true }),
    
    update: (id: string, data: Partial<UserResponse>): Promise<UserResponse> => 
      this.put<UserResponse>(`/users/${id}`, data, { requiresAuth: true }),
    
    delete: (id: string): Promise<void> => 
      this.delete<void>(`/users/${id}`, { requiresAuth: true }),
  };

  practices = {
    getAll: (): Promise<PracticeResponse[]> => 
      this.get<PracticeResponse[]>('/practices', { requiresAuth: true }),
    
    getById: (id: string): Promise<PracticeResponse> => 
      this.get<PracticeResponse>(`/practices/${id}`, { requiresAuth: true }),
    
    create: (data: Partial<PracticeResponse>): Promise<PracticeResponse> => 
      this.post<PracticeResponse>('/practices', data, { requiresAuth: true }),
    
    update: (id: string, data: Partial<PracticeResponse>): Promise<PracticeResponse> => 
      this.put<PracticeResponse>(`/practices/${id}`, data, { requiresAuth: true }),
    
    delete: (id: string): Promise<void> => 
      this.delete<void>(`/practices/${id}`, { requiresAuth: true }),
  };
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
