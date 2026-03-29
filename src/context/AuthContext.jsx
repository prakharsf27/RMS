import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("rms_token");
      if (token) {
        try {
          const { data } = await api.get("/auth/profile");
          setUser(data);
        } catch (err) {
          console.error("Session expired:", err);
          localStorage.removeItem("rms_token");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      localStorage.setItem("rms_token", data.token);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || "Login failed" 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      setUser(data);
      localStorage.setItem("rms_token", data.token);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || "Registration failed" 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rms_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
