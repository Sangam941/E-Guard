import apiClient from './apiClient';

export const getAlerts = async (userId: string) => {
  const response = await apiClient.get(`/alerts/${userId}`);
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

export const markAllAsRead = async (userId: string) => {
  const response = await apiClient.patch(`/alerts/user/${userId}/read-all`);
  return response.data;
};
