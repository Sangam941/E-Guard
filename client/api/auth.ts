import apiClient from './apiClient';

export interface AuthResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    token: string;
  };
}

export const registerUser = async (data: { name: string; email: string; password?: string }) => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: { email: string; password?: string }) => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get<AuthResponse>('/auth/me');
  return response.data;
};
