import { useEffect, useState } from "react";

import { getFoodReviews } from "../../services/reviewService";

function FoodReviewList({ menuId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!menuId) return;

    const loadReviews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getFoodReviews(menuId);
        setReviews(response.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load food reviews.");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [menuId]);

  if (!menuId) return null;

  return (
    <section className="mt-4">
      <h2 className="mb-3 text-lg font-bold">Food Reviews</h2>

      {loading && <p className="text-sm">Loading reviews...</p>}

      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p className="text-sm">No reviews yet.</p>
      )}

      {!loading &&
        !error &&
        reviews.map((review) => (
          <div key={review._id} className="mb-3 rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="font-semibold">{review.user_id?.name}</div>

              <span className="rounded bg-green-100 px-2 py-1 text-xs">
                Verified Purchase
              </span>
            </div>

            <div className="mt-2">⭐ {review.rating}</div>

            <p className="mt-1">{review.review}</p>
          </div>
        ))}
    </section>
  );
}

export default FoodReviewList;
