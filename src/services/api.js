
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE || "http://localhost:3005/api/v1", 
  withCredentials: true, 
});


export async function get(url, params) {
  const res = await api.get(url, { params });
  return res.data;
}

export async function post(url, data) {
  const res = await api.post(url, data);
  return res.data;
}

export async function patch(url, data, config) {
  const res = await api.patch(url, data, config);
  return res.data;
}

export async function del(url, config) {
  const res = await api.delete(url, config);
  return res.data;
}

// Specific API calls for your application
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

export async function toggleSubscription(username) {
  const res = await api.post(`/subscribe/c/${username}`);
  return res.data;
}

