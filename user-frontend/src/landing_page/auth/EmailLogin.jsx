import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FloatingInput from "./FloatingInput";
import { useAuth } from "../../context/AuthContext";

function EmailLogin() {
  const [email, setEmail] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  const handleSubmit = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    login({
      token: "mock-jwt-token",
      user: {
        email: trimmedEmail,
      },
    });

    navigate(redirectTo, { replace: true });
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
        disabled={!email.trim()}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-white font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send One Time Password
      </button>
    </>
  );
}

export default EmailLogin;
