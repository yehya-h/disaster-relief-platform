import api from './Interceptor';

export const getUserById = async () => {
    try {
      console.log("fct: getUserById");
      const response = await api.get(`/user`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
