import { useEffect, useState } from "react";

function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialRating = 5,
  initialReview = "",
  submitLabel = "Submit",
  onDelete,
  deleteLabel = "Delete Review",
  deleteConfirmMessage = "Are you sure?",
}) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRating(initialRating ?? 5);
    setReview(initialReview ?? "");
  }, [isOpen, initialRating, initialReview]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        rating,
        review,
      });

      alert("Review submitted successfully");

      setReview("");
      setRating(5);

      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = window.confirm(deleteConfirmMessage);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete();
      alert("Review deleted successfully");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-5 w-[400px]">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 w-full"
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
          onChange={(e) => setReview(e.target.value)}
        />

        <div className="flex gap-2 mt-4">
          {onDelete ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="border px-4 py-2 rounded disabled:opacity-70"
              type="button"
            >
              {deleting ? "Deleting..." : deleteLabel}
            </button>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-70"
            type="button"
          >
            {loading ? "Submitting..." : submitLabel}
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
