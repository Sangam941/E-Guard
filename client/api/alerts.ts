import apiClient from './apiClient';

export const getAlerts = async () => {
  const response = await apiClient.get('/alerts/');
  return response.data;
};

export const getAlertById = async (id: string) => {
  const response = await apiClient.get(`/alerts/detail/${id}`);
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await apiClient.patch(`/alerts/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  // Pass arbitrary string 'me' because backend expects /user/:userId/read-all but ignores the param
  const response = await apiClient.patch('/alerts/user/me/read-all');
  return response.data;
};
