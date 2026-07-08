import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FloatingInput from "./FloatingInput";
import { useAuth } from "../../context/AuthContext";
import AuthModalWrapper from "./AuthModalWrapper";
import { verifyEmail } from "../../services/authService";
import api from "../../api/axios";

function VerifyEmailOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isResending, setIsResending] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(50);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      // Start 50-second countdown on entry after signup
      setCountdownSeconds(50);
    } else {
      // If user directly opens /verify-email, we don't have a trusted email source.
      // Redirect them back to signup to restart the flow.
      navigate("/signup", { replace: true });
    }
  }, [location.state?.email, navigate]);

  useEffect(() => {
    if (!email) return;
    if (countdownSeconds <= 0) return;

    const t = window.setTimeout(() => {
      setCountdownSeconds((s) => s - 1);
    }, 1000);

    return () => window.clearTimeout(t);
  }, [countdownSeconds, email]);

  const handleVerify = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    // Prevent malformed first request / repeated backend hits
    if (!trimmedEmail) return;
    if (!trimmedOtp) return;
    if (!/^\d{4,8}$/.test(trimmedOtp)) {
      setError("OTP must be 4-8 digits.");
      setSuccess("");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Backend expects exactly { email, otp }
      const response = await verifyEmail({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      login(response.data);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e?.message || "Failed to verify email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    if (countdownSeconds > 0) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const trimmedEmail = email.trim().toLowerCase();
      await api.post("/api/auth/resend-verification-otp", {
        email: trimmedEmail,
      });

      setSuccess("OTP resent successfully.");
      setCountdownSeconds(50);
      setOtp("");
    } catch (e) {
      setError(e?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthModalWrapper title="Verify your email">
      <FloatingInput
        label="Email"
        type="email"
        value={email}
        readOnly
        tabIndex={-1}
        onFocus={(event) => event.target.blur()}
        inputClassName="pointer-events-none select-none caret-transparent bg-slate-50 text-slate-500"
        containerClassName="mb-4"
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
        disabled={
          !email.trim() ||
          !otp.trim() ||
          isSubmitting ||
          !/^\d{4,8}$/.test(otp.trim())
        }
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-white font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </button>

      {success ? (
        <p className="mt-3 text-sm text-green-600">{success}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={handleResend}
        disabled={!email.trim() || countdownSeconds > 0 || isResending}
        className="mt-4 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {countdownSeconds > 0
          ? `Resend OTP in ${countdownSeconds}s`
          : "Resend OTP"}
      </button>
    </AuthModalWrapper>
  );
}

export default VerifyEmailOtp;
