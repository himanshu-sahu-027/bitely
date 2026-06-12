import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FloatingInput from "./FloatingInput";
import { useAuth } from "../../context/AuthContext";
import AuthModalWrapper from "./AuthModalWrapper";
import { verifyEmail, loginUser } from "../../services/authService";
import { useEffect } from "react";

function VerifyEmailOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state?.email]);

  const handleVerify = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail || !trimmedOtp) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Backend returns token + user
      const response = await verifyEmail({ email: trimmedEmail, otp: trimmedOtp });
      login(response.data);

      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e?.message || "Failed to verify email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthModalWrapper title="Verify your email">
      <FloatingInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <FloatingInput
        label="OTP"
        type="text"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
      />

      <button
        type="button"
        onClick={handleVerify}
        disabled={!email.trim() || !otp.trim() || isSubmitting}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-white font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </AuthModalWrapper>
  );
}

export default VerifyEmailOtp;
