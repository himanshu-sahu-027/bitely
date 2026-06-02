import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FloatingInput from "./FloatingInput";
import { useAuth } from "../../context/AuthContext";
import { sendOtp, verifyOtp } from "../../services/authService";

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const otpResponse = await sendOtp({
        identifier: trimmedEmail,
        type: "email",
      });
      const devOtp = otpResponse.data?.devOtp;
      const enteredOtp = window.prompt(
        devOtp
          ? `Enter the OTP for ${trimmedEmail}. Dev OTP: ${devOtp}`
          : `Enter the OTP sent to ${trimmedEmail}`,
        devOtp || "",
      );

      if (!enteredOtp) {
        throw new Error("OTP verification was cancelled.");
      }

      const verifyResponse = await verifyOtp({
        identifier: trimmedEmail,
        type: "email",
        otp: enteredOtp.trim(),
      });

      login(verifyResponse.data);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FloatingInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!email.trim() || isSubmitting}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-white font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verifying..." : "Send One Time Password"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </>
  );
}

export default EmailLogin;
