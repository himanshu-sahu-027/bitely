/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { setUnauthorizedHandler } from "../api/axios";
import { getCurrentUser, logoutUser } from "../services/authService";

const AUTH_STORAGE_KEY = "bitely.auth";

const AuthContext = createContext(null);

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(readStoredSession()?.token));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!session) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSession(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function bootstrapSession() {
      if (!session?.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (!ignore) {
          setSession((currentSession) =>
            currentSession
              ? {
                  ...currentSession,
                  user: response.data,
                }
              : currentSession,
          );
        }
      } catch {
        if (!ignore) {
          setSession(null);
          window.alert(
            "We couldn't verify your session. Please log in again.",
          );
        }
      } finally {
        if (!ignore) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      ignore = true;
    };
  }, [session?.token]);

  const value = useMemo(
    () => ({
      session,
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      isBootstrapping,
      login: (nextSession) => setSession(nextSession),
      logout: async () => {
        try {
          if (session?.token) {
            await logoutUser();
          }
        } catch {
          window.alert(
            "Server logout failed. Your account has been logged out locally.",
          );
          // Clear stale sessions locally even if the API call fails.
        } finally {
          setSession(null);
        }
      },
      getAuthorizationHeader: () =>
        session?.token ? { Authorization: `Bearer ${session.token}` } : {},
    }),
    [isBootstrapping, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
