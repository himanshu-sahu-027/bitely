import { useEffect, useState } from "react";

function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialRating = 5,
  initialReview = "",
  submitLabel = "Submit",
  readOnly = false,
  helperText = "",
  errorText = "",
}) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setRating(initialRating ?? 5);
    setReview(initialReview ?? "");
    setError("");
  }, [isOpen, initialRating, initialReview]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (readOnly) return;

    setLoading(true);
    setError("");
    try {
      await onSubmit({
        rating,
        review,
      });
      onClose();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-5 w-[400px]">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {helperText ? (
          <p className="mb-3 text-sm text-slate-600">{helperText}</p>
        ) : null}

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          disabled={readOnly || loading}
          className="border p-2 w-full disabled:bg-slate-100 disabled:text-slate-600"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <option key={star} value={star}>
              {star} Star
            </option>
          ))}
        </select>

        <textarea
          className="border w-full mt-3 p-2"
          rows={4}
          placeholder="Write your review..."
          value={review}
          disabled={readOnly || loading}
          onChange={(e) => setReview(e.target.value)}
        />

        {error || errorText ? (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error || errorText}
          </div>
        ) : null}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || readOnly}
            className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-70"
            type="button"
          >
            {readOnly ? "Review Submitted" : loading ? "Submitting..." : submitLabel}
          </button>

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
