const SPRING_BOOT_API_BASE_URL = 'https://auth-spring-api.onrender.com/api';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// Spring Boot API response types
export interface SpringBootUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: SpringBootUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface VerifyResponse {
  user: SpringBootUser;
}

export async function callSpringBootApi<T = unknown>(
  endpoint: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    token?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, token } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${SPRING_BOOT_API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    return {
      data: response.ok ? responseData : undefined,
      error: !response.ok ? responseData.message || responseData.error || 'An error occurred' : undefined,
      status: response.status,
    };
  } catch (error) {
    console.error('Spring Boot API call failed:', error);
    return {
      error: 'Network error or server unavailable',
      status: 500,
    };
  }
}

export const springBootApiEndpoints = {
  login: '/auth/login',
  logout: '/auth/logout',
  verify: '/auth/verify',
  refreshToken: '/auth/refresh-token',
} as const;
