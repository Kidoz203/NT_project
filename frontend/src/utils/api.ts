import axios, { AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  User,
  Post,
  PostsResponse,
  CreatePostData,
  UpdateProfileData,
  NotificationsResponse,
  UnreadCountResponse
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.client.get<{ user: User }>('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  // User endpoints
  async getUserProfile(username: string): Promise<{ user: User }> {
    const response = await this.client.get<{ user: User }>(`/users/${username}`);
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<{ user: User; message: string }> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if ((key === 'profilePicture' || key === 'coverPhoto') && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'socialLinks' || key === 'notificationSettings') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await this.client.put<{ user: User; message: string }>(
      '/users/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async followUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/users/${userId}/unfollow`);
    return response.data;
  }

  async searchUsers(query: string): Promise<{ users: User[] }> {
    const response = await this.client.get<{ users: User[] }>(`/users/search/${query}`);
    return response.data;
  }

  async getUserFollowers(userId: string): Promise<{ followers: User[] }> {
    const response = await this.client.get<{ followers: User[] }>(`/users/${userId}/followers`);
    return response.data;
  }

  async getUserFollowing(userId: string): Promise<{ following: User[] }> {
    const response = await this.client.get<{ following: User[] }>(`/users/${userId}/following`);
    return response.data;
  }

  // Post endpoints
  async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const response = await this.client.get<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const response = await this.client.get<PostsResponse>(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getPost(postId: string): Promise<{ post: Post }> {
    const response = await this.client.get<{ post: Post }>(`/posts/${postId}`);
    return response.data;
  }

  async createPost(data: CreatePostData): Promise<{ post: Post; message: string }> {
    const formData = new FormData();
    
    if (data.content) formData.append('content', data.content);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.image) formData.append('image', data.image);

    const response = await this.client.post<{ post: Post; message: string }>(
      '/posts',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async updatePost(postId: string, data: { content?: string; visibility?: string }): Promise<{ post: Post; message: string }> {
    const response = await this.client.put<{ post: Post; message: string }>(`/posts/${postId}`, data);
    return response.data;
  }

  async deletePost(postId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/posts/${postId}`);
    return response.data;
  }

  async likePost(postId: string): Promise<{ message: string; liked: boolean; likeCount: number }> {
    const response = await this.client.post<{ message: string; liked: boolean; likeCount: number }>(`/posts/${postId}/like`);
    return response.data;
  }

  async addComment(postId: string, content: string): Promise<{ comment: any; message: string }> {
    const response = await this.client.post<{ comment: any; message: string }>(`/posts/${postId}/comments`, { content });
    return response.data;
  }

  async deleteComment(postId: string, commentId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  }

  async likeComment(postId: string, commentId: string): Promise<{ message: string; liked: boolean; likeCount: number }> {
    const response = await this.client.post<{ message: string; liked: boolean; likeCount: number }>(`/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  }

  // Notification endpoints
  async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
    const response = await this.client.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>('/notifications/read-all');
    return response.data;
  }

  async getUnreadNotificationCount(): Promise<UnreadCountResponse> {
    const response = await this.client.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/notifications/${notificationId}`);
    return response.data;
  }

  // User management endpoints
  async blockUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/users/${userId}/block`);
    return response.data;
  }

  async unblockUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/users/${userId}/unblock`);
    return response.data;
  }

  async addCloseFriend(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/users/${userId}/close-friend`);
    return response.data;
  }

  async removeCloseFriend(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/users/${userId}/remove-close-friend`);
    return response.data;
  }

  async getBlockedUsers(): Promise<{ blockedUsers: User[] }> {
    const response = await this.client.get<{ blockedUsers: User[] }>('/users/blocked');
    return response.data;
  }

  async getCloseFriends(): Promise<{ closeFriends: User[] }> {
    const response = await this.client.get<{ closeFriends: User[] }>('/users/close-friends');
    return response.data;
  }

  async deactivateAccount(): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>('/users/deactivate');
    return response.data;
  }

  async reactivateAccount(): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>('/users/reactivate');
    return response.data;
  }
}

export const apiClient = new ApiClient();
