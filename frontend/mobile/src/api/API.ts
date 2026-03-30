
import axios from 'axios';


const BASE_URL = process.env.EXPO_PUBLIC_API_URL;


// Use one Axios API for all request's.
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


