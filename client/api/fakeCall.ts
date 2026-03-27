import apiClient from './apiClient';

export const createFakeCall = async (callerName:string, callerNumber:string) => {
  console.log("callename:: ", callerName)
  console.log("number:: ", callerNumber)
  const response = await apiClient.post('/fake-call', {callerName, callerNumber});
  console.log(response.data.data)
  return response.data.data;
};

export const stopFakeCall = async (id: string) => {
  const response = await apiClient.patch(`/fake-call/${id}/stop`);
  return response.data;
};

export const getUserFakeCalls = async () => {
  const response = await apiClient.get('/fake-call/user');
  console.log(response.data.data)
  return response.data.data;
};
