import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app.
 * Exposes: { user, login, logout, updateUser, loading }
 *
 * "user" shape decoded from JWT (username only — the backend
 * doesn't expose a /me endpoint, so we decode the JWT payload locally):
 *   { userName: string, roles: string[] }
 *
 * We also store sentimentAnalysis pref locally after signup/profile update
 * so the Profile page can reflect it without a dedicated /me endpoint.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT payload (base64) — no library needed for reading claims
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        userName: payload.sub,
        // Roles are stored in Spring Security as ROLE_USER / ROLE_ADMIN
        roles: payload.roles || [],
        sentimentAnalysis: payload.sentimentAnalysis,
      };
    } catch {
      return null;
    }
  };

  // On mount — rehydrate user from localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        // Merge any extra prefs stored locally (e.g. sentimentAnalysis)
        const extras = JSON.parse(localStorage.getItem("userMeta") || "{}");
        setUser({ ...decoded, ...extras });
      } else {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  /**
   * login — called after receiving JWT from /public/login or Google OAuth.
   * @param {string} token - raw JWT string
   * @param {object} [meta] - optional extra fields (email, sentimentAnalysis)
   */
  const login = useCallback((token, meta = {}) => {
    localStorage.setItem("token", token);
    if (Object.keys(meta).length) {
      localStorage.setItem("userMeta", JSON.stringify(meta));
    }
    const decoded = decodeToken(token);
    setUser({ ...decoded, ...meta });
  }, []);

  /**
   * logout — clears token and resets state.
   */
  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  /**
   * updateUser — merge partial updates into user state & localStorage meta.
   * Called after PUT /user succeeds.
   * @param {object} updates - partial User fields
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      const { userName, roles, ...meta } = next;
      localStorage.setItem("userMeta", JSON.stringify(meta));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}