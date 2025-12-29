// Auth types

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface UserUpdate {
  full_name?: string;
  username?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface LoginCredentials {
  username: string; // Can be email or username
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: UserUpdate) => Promise<void>;
  changePassword: (data: PasswordChange) => Promise<void>;
}
