export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'gym_owner' | 'super_admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  gymHalls?: string[];
  stats?: {
    totalChallenges: number;
    completedChallenges: number;
    totalWorkouts: number;
    badges: Badge[];
    score: number;
  };
  isActive: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  name: string;
  description: string;
  earnedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
