import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthModalWrapper from "./AuthModalWrapper";
import FloatingInput from "./FloatingInput";
import GoogleIcon from "./GoogleIcon";
import AuthDivider from "./AuthDivider";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";
  const isFormValid =
    Boolean(fullName.trim()) &&
    Boolean(email.trim()) &&
    Boolean(phoneNumber.trim()) &&
    agree;

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedFullName || !trimmedEmail || !trimmedPhoneNumber) {
      setError("Please fill in all fields.");
      return;
    }

    if (!agree) {
      setError("Please accept the terms to continue.");
      return;
    }

    setError("");

    login({
      token: "mock-jwt-token",
      user: {
        name: trimmedFullName,
        email: trimmedEmail,
        phone: trimmedPhoneNumber,
      },
    });

    navigate(redirectTo, { replace: true });
  };

  return (
    <AuthModalWrapper title="Sign up">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <FloatingInput
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />

          <FloatingInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <FloatingInput
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        ) : null}

        {/* Terms Checkbox */}

        <label className="flex items-start gap-2 mt-4 text-sm text-gray-600 ">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            className="mt-1 accent-indigo-600"
          />

          <span>
            I agree to Bitely's{" "}
            <a
              href="/terms/customer"
              className="text-sky-600 hover:underline"
            >
              Terms of Service
            </a>
            ,{" "}
            <a
              href="/privacy"
              className="text-sky-600 hover:underline"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="/content-policies"
              className="text-sky-600 hover:underline"
            >
              Content Policies
            </a>
          </span>
        </label>

        {/* Create Account Button */}

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full mt-5 py-3 rounded-lg text-white font-medium transition
        ${
          isFormValid
            ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-90"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        >
          Create account
        </button>

        <AuthDivider />

        <button
          type="button"
          className="flex w-full items-center justify-center gap-3
        rounded-lg border border-gray-300 py-2.5 hover:bg-gray-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

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
