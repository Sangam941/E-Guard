import apiClient from './apiClient';

export const triggerSOS = async (latitude: number, longitude: number) => {
  const response = await apiClient.post('/sos', { latitude, longitude });
  console.log(response.data)
  return response.data;
};

export const getSOS = async (id: string) => {
  const response = await apiClient.get(`/sos/${id}`);
  return response.data;
};

export const getUserSOS = async () => {
  const response = await apiClient.get('/sos/user/me');
  return response.data;
};

export const updateSOSStatus = async (id: string, status: 'active' | 'resolved' | 'false_alarm') => {
  const response = await apiClient.patch(`/sos/${id}/status`, { status });
  return response.data;
};
