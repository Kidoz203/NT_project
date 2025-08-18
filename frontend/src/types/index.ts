export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  website?: string;
  coverPhoto?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  profileTheme?: 'default' | 'dark' | 'colorful' | 'minimal';
  notificationSettings?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    followNotifications?: boolean;
    likeNotifications?: boolean;
    commentNotifications?: boolean;
  };
  followers: number;
  following: number;
  isPrivate: boolean;
  accountStatus?: 'active' | 'deactivated' | 'suspended';
  createdAt: string;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  shares: number;
  visibility: 'public' | 'private' | 'followers';
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  isPrivate?: boolean;
  profilePicture?: File;
  coverPhoto?: File;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  profileTheme?: 'default' | 'dark' | 'colorful' | 'minimal';
  notificationSettings?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    followNotifications?: boolean;
    likeNotifications?: boolean;
    commentNotifications?: boolean;
  };
}

export interface CreatePostData {
  content?: string;
  image?: File;
  visibility?: 'public' | 'private' | 'followers';
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PostsResponse {
  posts: Post[];
  pagination: PaginationData;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  type: 'follow' | 'unfollow' | 'like' | 'comment' | 'comment_like';
  post?: {
    _id: string;
    content: string;
    image?: string;
  };
  comment?: string;
  read: boolean;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: PaginationData;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
