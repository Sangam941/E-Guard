import apiClient from './apiClient';


export const registerUser = async (name:string, email:string, password:string) => {
  const response = await apiClient.post('/auth/register', {name, email,password});
  console.log(response.data.data)
  return response.data;
};

export const loginUser = async (email: string, password: string ) => {
  const response = await apiClient.post('/auth/login', {email, password});
  console.log(response.data)
  return response.data.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};


