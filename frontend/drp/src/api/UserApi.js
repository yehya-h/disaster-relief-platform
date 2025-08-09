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

export const updateUserInfo = async (userData) => {
  try {
    const response = await api.put('/user/userInfo', {
      fname: userData.fname,
      lname: userData.lname
    });
    return response.data;
  } catch (error) {
    console.error('Update user info error:', error);
    throw error;
  }
}

export const updateUserPassword = async (passwordData) => {
  try {
    const response = await api.put('/user/userPassword', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

export const updateUserLocations = async (locations) => {
  try {
    const response = await api.put('/user/userLocations', {
      locations: locations
    });
    return response.data;
  } catch (error) {
    console.error('Update locations error:', error);
    throw error;
  }
};
