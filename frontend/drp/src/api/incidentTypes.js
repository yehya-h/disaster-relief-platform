// import axios from 'axios';
// import { setTypes } from './redux/incidentTypesSlice';

// const BASE_URL = 'http://10.0.2.2:3000/api';

// export const fetchIncidentTypes = () => async dispatch => {
//   try {
//     const response = await axios.get(`${BASE_URL}/types`);

//     if (!response || !response.data || !Array.isArray(response.data)) {
//       throw new Error('Invalid response format');
//     }

//     dispatch(setTypes(response.data));
//   } catch (error) {
//     console.error('Error fetching incident types:', error?.message || error);
//   }
// };

import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000/api';

export const getAllIncidentTypes = async () => {
  const response = await axios.get(`${BASE_URL}/types`);
  return response.data;
};
