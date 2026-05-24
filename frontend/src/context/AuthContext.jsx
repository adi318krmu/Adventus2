import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("tms_token"));
  const [role, setRole] = useState(sessionStorage.getItem("tms_role"));
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("tms_user");
    return saved ? JSON.parse(saved) : null;
  });

  const saveSession = (payload) => {
    sessionStorage.setItem("tms_token", payload.token);
    sessionStorage.setItem("tms_role", payload.role);
    sessionStorage.setItem("tms_user", JSON.stringify(payload.user));
    localStorage.removeItem("tms_token");
    localStorage.removeItem("tms_role");
    localStorage.removeItem("tms_user");
    setToken(payload.token);
    setRole(payload.role);
    setUser(payload.user);
  };

  const signup = async (form) => {
    const { data } = await api.post("/signup", form);
    saveSession(data);
    toast.success("Account created");
    return data;
  };

  const adminSignup = async (form) => {
    const { data } = await api.post("/admin/signup", form);
    saveSession(data);
    toast.success("Admin account created");
    return data;
  };

  const login = async (form) => {
    const { data } = await api.post("/login", form);
    saveSession(data);
    toast.success(`Welcome ${data.role === "admin" ? "Admin" : data.user.name}`);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem("tms_token");
    sessionStorage.removeItem("tms_role");
    sessionStorage.removeItem("tms_user");
    localStorage.removeItem("tms_token");
    localStorage.removeItem("tms_role");
    localStorage.removeItem("tms_user");
    setToken(null);
    setRole(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token || !role) return;
    const profileUrl = role === "admin" ? "/admin/profile" : "/student/profile";
    api.get(profileUrl).then(({ data }) => {
      setUser(data);
      sessionStorage.setItem("tms_user", JSON.stringify(data));
    }).catch(() => logout());
  }, [token, role]);

  const value = useMemo(() => ({ token, role, user, setUser, signup, adminSignup, login, logout, isAuthenticated: Boolean(token) }), [token, role, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
