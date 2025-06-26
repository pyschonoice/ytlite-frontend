// src/services/api.js
import axios from "axios";
// import { jwtDecode } from "jwt-decode"; // No longer needed if HttpOnly cookies are strictly used

export const api = axios.create({
  baseURL: "http://localhost:3005/api/v1",
  withCredentials: true,
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue for pending requests while token is refreshing
let failedRequestsQueue = [];

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    // console.log("API Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 Unauthorized and not during refresh token endpoint itself
    // Add a check to ensure it's not a request already being retried
    if (error.response?.status === 401 && originalRequest.url !== '/user/refresh-token' && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to avoid infinite loops

      if (isRefreshing) {
        // If a token refresh is already in progress, queue the original request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;

      try {
        // Make request to refresh token endpoint
        const res = await api.post('/user/refresh-token');

        // The browser will automatically set the new HttpOnly access & refresh tokens.
        // If your backend also returns tokens in the body, you could store them here
        // (e.g., localStorage if not HttpOnly, but HttpOnly is preferred).

        // Retry all queued requests with the new token (cookies will be updated by browser)
        failedRequestsQueue.forEach(({ resolve, originalRequest: req }) => {
          resolve(api(req));
        });
        failedRequestsQueue = []; // Clear the queue

        // Retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, reject all queued requests and redirect to login
        failedRequestsQueue.forEach(({ reject }) => reject(refreshError));
        failedRequestsQueue = [];
        console.error("Refresh token failed, logging out:", refreshError);
        // Navigate to login page - full page reload to ensure all state is cleared
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

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

export async function updateUserDetails(data) {
  const res = await api.patch("/user/update-user", data);
  return res.data;
}

export async function changeUserPassword(data) {
  const res = await api.post("/user/change-password", data);
  return res.data;
}

export async function updateUserAvatar(data) {
  const res = await api.patch("/user/update-avatar", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function updateUserCoverImage(data) {
  const res = await api.patch("/user/update-cover", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// Toggle subscription for a channel by username
export async function toggleSubscription(username) {
  const res = await api.post(`/subscribe/c/${username}`);
  return res.data;
}