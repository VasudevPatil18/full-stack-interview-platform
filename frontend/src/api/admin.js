import axios from "../lib/axios";

export const adminApi = {
  // Dashboard stats
  getStats: async () => {
    const response = await axios.get("/admin/stats");
    return response.data;
  },

  // User management
  getUsers: async (params) => {
    const response = await axios.get("/admin/users", { params });
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axios.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Session management
  getSessions: async (params) => {
    const response = await axios.get("/admin/sessions", { params });
    return response.data;
  },

  forceEndSession: async (id) => {
    const response = await axios.post(`/admin/sessions/${id}/end`);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await axios.get("/admin/analytics");
    return response.data;
  },
};
