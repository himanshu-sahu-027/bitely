import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";

import AuthModalWrapper from "./AuthModalWrapper";
import PhoneLogin from "./PhoneLogin";
import EmailLogin from "./EmailLogin";
import GoogleIcon from "./GoogleIcon";
import AuthDivider from "./AuthDivider";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [mode, setMode] = useState("phone");
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? "/profile"} replace />;
  }

  return (
    <AuthModalWrapper title="Log in">
      {mode === "phone" ? <PhoneLogin /> : <EmailLogin />}

      <AuthDivider />

      {mode === "phone" && (
        <button
          onClick={() => setMode("email")}
          className="mb-3 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 py-2.5 text-sky-700 hover:bg-gray-50"
        >
          <Mail size={18} />
          Continue with Email
        </button>
      )}

      <button
        className="flex w-full items-center justify-center gap-3
        rounded-lg border border-gray-300 py-2.5 hover:bg-gray-50"
      >
        <GoogleIcon />
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-500">
        New to Bitely?{" "}
        <Link to="/signup" className="font-semibold text-sky-600">
          Create account
        </Link>
      </p>
    </AuthModalWrapper>
  );
}

export default Login;
