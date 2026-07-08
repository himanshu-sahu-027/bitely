import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import FloatingInput from "./FloatingInput";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginUser({
        email: trimmedEmail,
        password,
      });

      login(response.data);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 gap-3">
      <FloatingInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <FloatingInput
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        enablePasswordToggle
      />
    </div>
      
      

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!email.trim() || !password || isSubmitting}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-white font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>

      <div className="flex justify-end mt-2 mr-1">
        <Link
          to="/forgot-password"
          className="text-xs font-medium text-sky-600 "
        >
          Forgot Password? 
        </Link>
      </div>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </>
  );
}

export default EmailLogin;
