import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import popularFoods from "../../../data/popularFoods";
import foods from "../../../data/foods";
import PopularFoodItem from "./PopularFoodsItem";

function PopularFoodsSlider() {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Merge the popular-food order data with full food details like name and slug.
  const popularFoodItems = popularFoods
    .map((popularFood) => {
      const matchedFood = foods.find((food) => food.id === popularFood.foodId);

      if (!matchedFood) {
        return null;
      }

      return {
        ...matchedFood,
        ...popularFood,
      };
    })
    .filter(Boolean);

  // Keep the arrow buttons in sync with the current scroll position.
  const updateScrollState = () => {
    const slider = sliderRef.current;

    if (!slider) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    setCanScrollLeft(slider.scrollLeft > 0);
    setCanScrollRight(maxScrollLeft - slider.scrollLeft > 1);
  };

  useEffect(() => {
    updateScrollState();

    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [popularFoodItems.length]);

  // Move the slider by a responsive amount on arrow click.
  const scrollByAmount = (direction) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const amount = Math.max(280, Math.round(slider.clientWidth * 0.75));

    // Fallback to direct scrollLeft update for browsers with limited scrollBy options support.
    if (typeof slider.scrollBy === "function") {
      slider.scrollBy({ left: amount * direction, behavior: "smooth" });
    } else {
      slider.scrollLeft += amount * direction;
    }

    requestAnimationFrame(updateScrollState);
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-white to-transparent" />
      )}

      {canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-white to-transparent" />
      )}

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors duration-200 hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div
        ref={sliderRef}
        onScroll={updateScrollState}
        className="flex gap-8 overflow-x-auto scrollbar-hide px-12"
      >
        {popularFoodItems.map((food) => (
          <PopularFoodItem key={food.id} food={food} />
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors duration-200 hover:bg-gray-50"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

export default PopularFoodsSlider;
