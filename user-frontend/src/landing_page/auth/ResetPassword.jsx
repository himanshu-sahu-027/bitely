import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthModalWrapper from "./AuthModalWrapper";
import FloatingInput from "./FloatingInput";

import { resetPassword } from "../../services/authService";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const defaultEmail =
    location.state?.email || "";

  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isFormValid =
    Boolean(email.trim()) &&
    Boolean(otp.trim()) &&
    Boolean(password) &&
    Boolean(confirmPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      navigate("/login", {
        replace: true,
      });
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Failed to reset password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthModalWrapper title="Reset Password">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3">
          <FloatingInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <FloatingInput
            label="OTP"
            type="text"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value)
            }
          />

          <FloatingInput
            label="New Password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <FloatingInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
          />
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>
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
          {isSubmitting
            ? "Resetting Password..."
            : "Reset Password"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-6">
          Back to{" "}
          <Link
            to="/login"
            className="font-semibold text-sky-600"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthModalWrapper>
  );
}

export default ResetPassword;