import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname ?? "/profile";

  const handleSubmit = () => {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      return;
    }

    login({
      token: "mock-jwt-token",
      user: {
        phone: `+91 ${trimmedPhone}`,
      },
    });

    navigate(redirectTo, { replace: true });
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
        disabled={!phone.trim()}
        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-white font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send One Time Password
      </button>
    </>
  );
}

export default PhoneLogin;
