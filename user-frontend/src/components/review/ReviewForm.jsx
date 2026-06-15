import { useState } from "react";

function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      rating,
      review,
    });

    setReview("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Write a Review</h3>

      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <option key={star} value={star}>
            {star} Star
          </option>
        ))}
      </select>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share your experience..."
      />

      <button type="submit">Submit Review</button>
    </form>
  );
}

export default ReviewForm;
