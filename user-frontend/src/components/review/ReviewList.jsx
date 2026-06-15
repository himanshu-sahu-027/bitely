import { useEffect, useState } from "react";

import { getKitchenReviews } from "../../services/reviewService";

function ReviewList({ kitchenId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await getKitchenReviews(kitchenId);

        setReviews(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadReviews();
  }, [kitchenId]);

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-bold">Customer Reviews</h2>

      {reviews.length === 0 && <p>No reviews yet.</p>}

      {reviews.map((review) => (
        <div key={review._id} className="mb-4 rounded-lg border p-4">
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

export default ReviewList;
