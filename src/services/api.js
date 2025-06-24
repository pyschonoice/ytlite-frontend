import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3005/api/v1", 
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error("Network Error: Cannot connect to server. Please check if the backend is running on port 3005");
    } else {
      console.error("API Response Error:", error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export async function get(url, params) {
  const res = await api.get(url, { params });
  return res.data;
}

export async function post(url, data) {
  const res = await api.post(url, data);
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("/user/current-user");
  return res.data;
}

// Toggle subscription for a channel by username
export async function toggleSubscription(username) {
  const res = await api.post(`/subscribe/c/${username}`);
  return res.data;
} 