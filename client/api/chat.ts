import apiClient from './apiClient';

export const sendMessage = async (data: { chatId?: string; message: string; role?: 'user' | 'assistant'; context?: any }) => {
  const response = await apiClient.post('/chat', data);
  return response.data;
};

export const getChatHistory = async (chatId: string) => {
  const response = await apiClient.get(`/chat/${chatId}`);
  return response.data;
};

export const getUserChats = async () => {
  const response = await apiClient.get('/chat/user');
  return response.data;
};
