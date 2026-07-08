import { useCallback, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import AuthModalWrapper from "./AuthModalWrapper";
import FloatingInput from "./FloatingInput";
import AuthDivider from "./AuthDivider";
import { registerUser, googleSignIn } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  const isFormValid =
    Boolean(name.trim()) &&
    Boolean(email.trim()) &&
    Boolean(password) &&
    Boolean(confirmPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
        confirmPassword,
      });

      navigate("/verify-email", {
        replace: true,
        state: { email: trimmedEmail, from: { pathname: redirectTo } },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      const credential = credentialResponse?.credential;
      if (!credential) {
        return;
      }

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
    <AuthModalWrapper title="Sign up">
      <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3">
            <FloatingInput
              label="Name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

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

            <FloatingInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              enablePasswordToggle
            />
          </div>

          {error ? (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full mt-5 py-3 rounded-lg text-white font-medium transition
        ${
          isFormValid && !isSubmitting
            ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-90"
            : "bg-gray-300 cursor-not-allowed"
        }`}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <AuthDivider />

          <div className="mt-1 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                // keep silent; show error handling later if needed
              }}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
            />
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-sky-600">
              Log in
            </Link>
          </p>
      </form>
    </AuthModalWrapper>
  );
}

export default Signup;
