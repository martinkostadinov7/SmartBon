import { apiClient, setAuthToken } from './apiClient';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/Auth/login', payload);
  const token = data.value ?? data.token;

  if (!token) {
    throw new Error('Missing token in login response');
  }

  setAuthToken(token);
  return data;
}

export async function register(payload: RegisterRequest): Promise<void> {
  await apiClient.post('/api/Auth/register', payload);
}

export async function logout(): Promise<void> {
  setAuthToken(undefined);
}
