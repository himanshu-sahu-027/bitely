import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          authPrompt: {
            message: "Please login to continue",
            blockedPath: location.pathname,
            timestamp: Date.now(),
          },
        }}
      />
    );
  }

  return children;
}
