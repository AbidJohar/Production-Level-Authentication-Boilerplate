import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
//  Axios instance
// ─────────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // CRITICAL: sends cookies with every request
});

// ─────────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Tracks whether a token refresh is already in flight so that
   * multiple concurrent failing requests queue up and share one
   * refresh call rather than each triggering their own.
   */
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  /** Resolves or rejects all queued requests after a refresh attempt. */
  const processQueue = (error) => {
    failedQueue.current.forEach((p) =>
      error ? p.reject(error) : p.resolve()
    );
    failedQueue.current = [];
  };


// ─────────────────────────────────────────────────────────────
// Routes that should NEVER trigger a silent token refresh.
// If any of these return a 401, it's a real auth error (wrong
// password, unverified account, etc.) — not an expired session.
// ─────────────────────────────────────────────────────────────

  const SKIP_REFRESH_ROUTES = [
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/forget-password",
  "/auth/reset-password",
  "/auth/resend-otp",
  "/auth/verify-email",
];

  // ─── Initial session check ────────────────────────────────

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await API.get("/user/profile");
        if (res.data.success) {
          setUser(res.data.userData);
        }
      } catch (err) {
        // accessToken missing or expired — the interceptor isn't attached yet
        // at this point so we manually attempt a refresh before giving up.
        if (err.response?.status === 401) {
          try {
            const refreshRes = await API.post("/auth/refresh");
            if (refreshRes.data.success) {
              // New accessToken cookie is now set by the backend.
              // Retry the profile call with the fresh token.
              const retryRes = await API.get("/user/profile");
              if (retryRes.data.success) {
                setUser(retryRes.data.userData);
              }
            }
          } catch {
             
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  // ─── Silent refresh interceptor ───────────────────────────
  
  // Flow:
  // 1. Any protected API call receives a 401.
  // 2. We check the URL — if it's a public auth route we skip refresh
  //    and let the real error propagate to the caller (e.g. login page).
  // 3. Otherwise we hit POST /auth/refresh — the browser automatically
  //    sends the httpOnly refreshToken cookie.
  // 4. On success the backend rotates both cookies and we replay
  //    the original request.
  // 5. On failure we clear state and redirect to /login.

   useEffect(() => {
    if (loading) return; // Don't attach interceptor during the initial check

    const interceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401s that haven't already been retried
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // THE FIX: Skip refresh for all public auth routes.
        // Without this, a 401 from /auth/login (wrong password) would
        // trigger a refresh attempt and show "No refresh token" instead
        // of the real error message.
        const isPublicRoute = SKIP_REFRESH_ROUTES.some((route) =>
          originalRequest.url?.includes(route)
        );
        if (isPublicRoute) {
          return Promise.reject(error);
        }

        if (isRefreshing.current) {
          // Another refresh is in flight — queue this request
          return new Promise((resolve, reject) => {
            failedQueue.current.push({ resolve, reject });
          }).then(() => API(originalRequest));
        }

        // Mark as retried so we don't loop
        originalRequest._retry = true;
        isRefreshing.current = true;

        try {
          const res = await API.post("/auth/refresh");
          if (res.data.success) {
            setUser(res.data.user);
          }
          processQueue(null);
          return API(originalRequest); // Replay original request
        } catch (refreshError) {
          processQueue(refreshError);
          setUser(null);
          navigate("/login");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing.current = false;
        }
      }
    );

    return () => API.interceptors.response.eject(interceptor);
  }, [loading, navigate]);

  // ─── Auth methods ─────────────────────────────────────────

  const signUp = async (userData) => {
    try {
      const res = await API.post("/auth/register", userData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
        errors: err.response?.data?.errors || [],
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message, user: res.data.user };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      const res = await API.get("/auth/logout");
      if (res.data.success) {
        setUser(null);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      console.error("Logout failed", err);
      // Force local logout even if the server call fails
      setUser(null);
    }
  };

  const resendOtp = async () => {
    const email = user?.email;
    if (!email) {
      return { success: false, message: "User email not found. Please login again." };
    }
    try {
      const response = await API.post("/auth/resend-otp", {
        email,
        otpType: "VERIFY_EMAIL",
      });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP",
      };
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const email = user?.email;
      if (!email) {
        return { success: false, message: "User email not found. Please login again." };
      }

      const res = await API.post("/auth/verify-email", { email, otp });
      if (res.data.success) {
        setUser((prev) => ({ ...prev, isVerified: true }));
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Verification failed",
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      const res = await API.post("/auth/forget-password", { email });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to send OTP" };
    }
  };

  const verifyAndResetPassword = async (data) => {
    try {
      const res = await API.post("/auth/reset-password", data);
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Reset failed" };
    }
  };

  // ─── Context value ────────────────────────────────────────

  const value = {
    user,
    loading,
    login,
    signUp,
    logout,
    verifyOtp,
    resendOtp,
    verifyAndResetPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
          {children}
    </AuthContext.Provider>
  );
};