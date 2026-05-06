import { useState } from "react";
import { Link } from "react-router-dom";

import AuthModalWrapper from "./AuthModalWrapper";
import FloatingInput from "./FloatingInput";
import GoogleIcon from "./GoogleIcon";
import AuthDivider from "./AuthDivider";

function Signup() {
  const [agree, setAgree] = useState(false);

  return (
    <AuthModalWrapper title="Sign up">
      <div className="flex flex-col gap-4">
        <FloatingInput label="Full Name" type="text" />

        <FloatingInput label="Email" type="email" />

        <FloatingInput label="Phone Number" type="tel" />
      </div>

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
        disabled={!agree}
        className={`w-full mt-5 py-3 rounded-lg text-white font-medium transition
        ${
          agree
            ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-90"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Create account
      </button>

      <AuthDivider />

      <button
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
    </AuthModalWrapper>
  );
}

export default Signup;
