import { Link } from "react-router-dom";
import { Home,  ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50 px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-8xl font-extrabold text-blue-800">404</h1>

        <h2 className="mt-4 text-3xl font-bold text-slate-900">
          Oops! Page Not Found
        </h2>

        <p className="mt-4 text-slate-600 leading-relaxed">
          The page you're looking for doesn't exist, may have been moved,
          or the URL might be incorrect.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-white shadow-md transition hover:bg-blue-700"
          >
            <Home size={18} />
            Back to Home
          </Link>


          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-3 text-slate-700 shadow-sm transition hover:bg-slate-100 "
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;