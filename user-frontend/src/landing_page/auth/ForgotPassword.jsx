import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthModalWrapper from "./AuthModalWrapper";
import FloatingInput from "./FloatingInput";

import { forgotPassword } from "../../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const isFormValid = Boolean(email.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword({
        email: trimmedEmail,
      });

      navigate("/reset-password", {
        state: {
          email: trimmedEmail,
        },
      });
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Failed to send reset OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthModalWrapper title="Forgot Password">
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
            ? "Sending OTP..."
            : "Send Reset OTP"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-6">
          Remember your password?{" "}
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

export default ForgotPassword;