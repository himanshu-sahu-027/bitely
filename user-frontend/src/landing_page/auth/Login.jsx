import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

import AuthModalWrapper from "./AuthModalWrapper";
import EmailLogin from "./EmailLogin";
import GoogleIcon from "./GoogleIcon";
import AuthDivider from "./AuthDivider";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from "react";
import { googleSignIn } from "../../services/authService";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      const credential = credentialResponse?.credential;
      if (!credential) return;

      const response = await googleSignIn({ credential });

      login(response.data);
      navigate(redirectTo, { replace: true });
    },
    [login, navigate, redirectTo],
  );

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthModalWrapper title="Log in">
        <EmailLogin />

        <AuthDivider />

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            // keep silent; show error handling later if needed
          }}
          render={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              className="flex w-full items-center justify-center gap-3
        rounded-lg border border-gray-300 py-2.5 hover:bg-gray-50"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          )}
        />

        <p className="mt-6 text-center text-sm text-gray-500">
          New to Bitely?{" "}
          <Link to="/signup" className="font-semibold text-sky-600">
            Create account
          </Link>
        </p>
      </AuthModalWrapper>
    </GoogleOAuthProvider>
  );
}

export default Login;
