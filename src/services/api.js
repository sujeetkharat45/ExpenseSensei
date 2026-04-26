import axios from "axios";
import * as SecureStore from "expo-secure-store";

// CHANGE THIS to your current Laptop IP address
const API_URL = "http://192.168.1.7:5000"; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const secureStorage = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("SecureStore getItem error:", error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore setItem error:", error);
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore removeItem error:", error);
    }
  },
};

// --- AUTH INTERCEPTOR ---
api.interceptors.request.use(
  async (config) => {
    // 🔥 Skip token check for Login and Register routes
    if (config.url.includes("/auth/login") || config.url.includes("/auth/register")) {
      return config;
    }

    try {
      const token = await secureStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Token retrieval error:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
 register: async (name, email, password, gender, mobile) => {
    try {
      const response = await api.post("/api/auth/register", { name, email, password, gender, mobile });
      if (response.data.token) {
        await secureStorage.setItem("authToken", response.data.token);
        await secureStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Registration failed" };
    }
  },
  login: async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      if (response.data.token) {
        await secureStorage.setItem("authToken", response.data.token);
        await secureStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Invalid credentials" };
    }
  },

  logout: async () => {
    await secureStorage.removeItem("authToken");
    await secureStorage.removeItem("user");
  },

  updateLimit: async (limit) => {
    try {
      const response = await api.put("/api/auth/limit", { limit });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data };
    }
  },

deleteAccount: async () => {
    const response = await api.delete("/api/auth/delete-account");
    return response.data;
  }
};

export const transactionService = {
  addTransaction: async (txnData) => {
    try {
      const response = await api.post("/api/transactions", txnData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  },
  getTransactions: async () => {
    try {
      const response = await api.get("/api/transactions");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  },
};
export const goalService = {
  getGoal: async () => {
    const response = await api.get("/api/goals"); // This must match the backend route
    return response.data;
  },
  saveGoal: async (goalData) => {
    const response = await api.post("/api/goals", goalData);
    return response.data;
  }
};


export default api;