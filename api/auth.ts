import { BaseAPI, TokenManager } from './config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'manager' | 'user';
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'manager' | 'user';
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  last_login: string;
  created_at: string;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

class AuthAPI extends BaseAPI {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login', credentials);
    
    // Store token and user data
    TokenManager.setToken(response.token);
    TokenManager.setUser(response.user);
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<{ message: string; user: any }> {
    return this.post('/auth/register', userData);
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.post('/auth/logout');
      return response;
    } finally {
      // Always clear local storage even if API call fails
      TokenManager.removeToken();
    }
  }

  async getCurrentUser(): Promise<{ user: UserProfile }> {
    return this.get('/auth/me');
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<{ message: string; user: UserProfile }> {
    const response = await this.put('/auth/profile', profileData);
    
    // Update stored user data
    TokenManager.setUser(response.user);
    
    return response;
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    return this.put('/auth/password', passwordData);
  }

  async refreshToken(): Promise<{ message: string; token: string }> {
    const response = await this.post('/auth/refresh');
    
    // Update stored token
    TokenManager.setToken(response.token);
    
    return response;
  }

  // Helper methods
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  getCurrentUserData(): any | null {
    return TokenManager.getUser();
  }

  clearAuth(): void {
    TokenManager.removeToken();
  }
}

export const authAPI = new AuthAPI();