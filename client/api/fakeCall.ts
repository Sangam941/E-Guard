import apiClient from './apiClient';

export const createFakeCall = async (data: { callerName: string; callerNumber: string; delaySeconds?: number; scheduleTime?: Date; duration?: number }) => {
  const response = await apiClient.post('/fake-call', data);
  return response.data;
};

export const stopFakeCall = async (id: string) => {
  const response = await apiClient.patch(`/fake-call/${id}/stop`);
  return response.data;
};

export const getUserFakeCalls = async () => {
  const response = await apiClient.get('/fake-call/user');
  return response.data;
};
