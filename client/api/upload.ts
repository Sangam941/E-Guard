import apiClient from './apiClient';

export const uploadEvidence = async (data: FormData) => {
  const response = await apiClient.post('/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUploadProgress = async (sosId: string) => {
  const response = await apiClient.get(`/upload/progress/${sosId}`);
  return response.data;
};
