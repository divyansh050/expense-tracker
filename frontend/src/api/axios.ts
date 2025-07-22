import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api", // ✅ your base URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ✅ token must be stored here
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ✅ Authorization header format
  }
  return config;
});

export default api;
