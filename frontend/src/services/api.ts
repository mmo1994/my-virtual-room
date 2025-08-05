// API service for connecting to Spacify backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class ApiService {
  private accessToken: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.accessToken = localStorage.getItem('spacify_access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type if not FormData (browser will set it for FormData)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      console.log('Making request to:', url);
      console.log('Headers:', headers);
      console.log('Options:', options);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      console.error('Error details:', {
        endpoint,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend server is running.');
      }
      
      throw error;
    }
  }

  // Auth methods
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const result = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (result.success && result.data) {
      this.setTokens(result.data.tokens);
    }

    return result;
  }

  async login(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    const result = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    if (result.success && result.data) {
      this.setTokens(result.data.tokens);
    }

    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    this.clearTokens();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/auth/verify-email/${token}`);
  }

  // Project methods
  async getProjects(page = 1, limit = 20): Promise<ApiResponse<any[]>> {
    return this.request(`/projects?page=${page}&limit=${limit}`);
  }

  async createProject(projectData: {
    name: string;
    description?: string;
    styleDescription: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`);
  }

  async updateProject(id: string, projectData: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Furniture methods
  async getFurniture(filters: {
    category?: string;
    style?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request(`/furniture?${queryParams.toString()}`);
  }

  async getFurnitureCategories(): Promise<ApiResponse<string[]>> {
    return this.request('/furniture/categories');
  }

  async getFurnitureItem(id: string): Promise<ApiResponse<any>> {
    return this.request(`/furniture/${id}`);
  }

  async trackAffiliateClick(furnitureId: string): Promise<ApiResponse> {
    return this.request(`/furniture/${furnitureId}/click`, {
      method: 'POST',
    });
  }

  // File upload methods
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.request('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it
      },
    });
  }

  // Room image upload for projects
  async uploadRoomImage(file: File): Promise<ApiResponse<{ imageId: string; filename: string; size: number; url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.request('/projects/upload-room', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it
      },
    });
  }

  // Generate furniture visualization
  async generateVisualization(data: {
    roomImageId: string;
    furnitureItems: Array<{ id: string; name: string; image: string }>;
    styleDescription: string;
  }): Promise<ApiResponse<{ visualizationId: string; url: string; generatedAt: string; styleDescription: string; furnitureCount: number }>> {
    return this.request('/projects/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Token management
  private setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    this.accessToken = tokens.accessToken;
    localStorage.setItem('spacify_access_token', tokens.accessToken);
    localStorage.setItem('spacify_refresh_token', tokens.refreshToken);
  }

  private clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('spacify_access_token');
    localStorage.removeItem('spacify_refresh_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Health check
  async checkHealth(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService; 