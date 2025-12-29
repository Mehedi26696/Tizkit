// Auth API functions: register(), login(), getMe()

import apiClient from './client';
import { User, UserCreate, LoginCredentials, Token, UserUpdate, PasswordChange } from '@/types/auth';

/**
 * Register a new user
 */
export async function register(data: UserCreate): Promise<User> {
  const response = await apiClient.post<User>('/auth/register', data);
  return response.data;
}

/**
 * Login user with username/email and password
 * Backend expects form data for OAuth2PasswordRequestForm
 */
export async function login(credentials: LoginCredentials): Promise<Token> {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await apiClient.post<Token>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

/**
 * Get current authenticated user
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

/**
 * Update current user's profile
 */
export async function updateMe(data: UserUpdate): Promise<User> {
  const response = await apiClient.put<User>('/auth/me', data);
  return response.data;
}

/**
 * Change current user's password
 */
export async function changePassword(data: PasswordChange): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/auth/me/change-password', data);
  return response.data;
}
