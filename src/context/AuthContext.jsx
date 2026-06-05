import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { login as apiLogin, register as apiRegister, getProfile, logout as apiLogout } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, attempt to restore session via the HTTP-only cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getProfile();
        if (res?.user) {
          setUser(res.user);
        }
      } catch {
        // No valid session cookie — user stays null
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      if (res?.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (err) {
      console.error("Login error:", err);
      const errMsg = err.response?.data?.message || "Invalid credentials";
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const res = await apiRegister(userData);
      return { success: true, message: res.message };
    } catch (err) {
      console.error("Registration error:", err);
      const errMsg = err.response?.data?.message || "Registration failed";
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Called after Google OAuth redirect — cookie is already set by the backend
  const loginWithGoogle = useCallback(async () => {
    try {
      const res = await getProfile();
      if (res?.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      registerUser,
      loginWithGoogle,
      logout,
    }),
    [user, loading, login, registerUser, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
