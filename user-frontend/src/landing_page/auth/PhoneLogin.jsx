import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { sendOtp, verifyOtp } from "../../services/authService";

function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  const handleSubmit = async () => {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const otpResponse = await sendOtp({
        identifier: trimmedPhone,
        type: "phone",
      });
      const devOtp = otpResponse.data?.devOtp;
      const enteredOtp = window.prompt(
        devOtp
          ? `Enter the OTP for ${trimmedPhone}. Dev OTP: ${devOtp}`
          : `Enter the OTP sent to ${trimmedPhone}`,
        devOtp || "",
      );

      if (!enteredOtp) {
        throw new Error("OTP verification was cancelled.");
      }

      const verifyResponse = await verifyOtp({
        identifier: trimmedPhone,
        type: "phone",
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
      <div className="auth-phone-input mb-4 flex items-center rounded-lg border border-gray-300 px-3 py-2">
        <span className="mr-2 text-base" aria-hidden="true">
          India
        </span>

        <select
          className="mr-2 bg-transparent text-sm text-gray-600 outline-none"
          defaultValue="+91"
        >
          <option value="+91">+91</option>
        </select>

        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!phone.trim() || isSubmitting}
        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-white font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verifying..." : "Send One Time Password"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </>
  );
}

export default PhoneLogin;
