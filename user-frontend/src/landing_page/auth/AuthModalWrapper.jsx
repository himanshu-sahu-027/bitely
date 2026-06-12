import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function AuthModalWrapper({ children, title }) {

  const navigate = useNavigate();
  const location = useLocation();
  const closeTarget = location.state?.from?.pathname ?? "/";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md mt-10"
      onClick={() => navigate(closeTarget)}
    >

      <div
        className="relative w-[420px] rounded-xl bg-white p-7 shadow-2xl mt-5"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="absolute right-4 top-4 text-gray-500"
          onClick={() => navigate(closeTarget)}
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-3xl font-semibold text-blue-900">
          {title}
        </h2>

        {children}

      </div>

    </div>
  );
}

export default AuthModalWrapper;
