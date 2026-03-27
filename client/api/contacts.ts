import apiClient from './apiClient';

export const createContact = async (data: { userId: string; name: string; phone: string; email?: string; relationship?: string; isPrimary?: boolean }) => {
  const response = await apiClient.post('/contacts', data);
  return response.data;
};

export const getContacts = async (userId: string) => {
  const response = await apiClient.get(`/contacts/${userId}`);
  return response.data;
};

export const updateContact = async (id: string, updates: any) => {
  const response = await apiClient.patch(`/contacts/${id}`, updates);
  return response.data;
};

export const deleteContact = async (id: string) => {
  const response = await apiClient.delete(`/contacts/${id}`);
  return response.data;
};
