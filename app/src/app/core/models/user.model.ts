export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'INSTRUCTOR' | 'LEARNER';
  phoneNumber?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterInstructorRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RegisterWithInviteRequest {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
