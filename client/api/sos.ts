import apiClient from './apiClient';

export const triggerSOS = async (data: { userId: string; latitude: number; longitude: number; address?: string; silentMode?: boolean }) => {
  const response = await apiClient.post('/sos', data);
  return response.data;
};

export const getSOS = async (id: string) => {
  const response = await apiClient.get(`/sos/${id}`);
  return response.data;
};

export const getUserSOS = async (userId: string) => {
  const response = await apiClient.get(`/sos/user/${userId}`);
  return response.data;
};

export const updateSOSStatus = async (id: string, status: 'active' | 'resolved' | 'false_alarm') => {
  const response = await apiClient.patch(`/sos/${id}/status`, { status });
  return response.data;
};
