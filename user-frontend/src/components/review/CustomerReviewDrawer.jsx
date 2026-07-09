import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";

function CustomerReviewDrawer({
  isOpen,
  title,
  loadReviews,
  emptyMessage = "No reviews yet.",
  onClose,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !loadReviews) return;

    let ignore = false;

    const fetchReviews = async () => {
      setLoading(true);
      setError("");

      try {
        const nextReviews = await loadReviews();
        if (!ignore) {
          setReviews(Array.isArray(nextReviews) ? nextReviews : []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Failed to load reviews.");
          setReviews([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      ignore = true;
    };
  }, [isOpen, loadReviews]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[9998] bg-slate-950/35 transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-[9999] h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 sm:max-w-lg ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Verified customer feedback from Bitely orders.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
              aria-label="Close review drawer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Loading reviews...
              </div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {!loading && !error && reviews.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {emptyMessage}
              </div>
            ) : null}

            {!loading && !error && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {review.user_id?.name ?? review.user_id?.full_name ?? "Bitely Customer"}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          <Star size={12} className="fill-current" />
                          {review.rating}
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Verified
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {review.review || "Customer left a rating without a written review."}
                    </p>

                    <div className="mt-3 text-xs text-slate-400">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleString("en-IN")
                        : ""}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}

export default CustomerReviewDrawer;
