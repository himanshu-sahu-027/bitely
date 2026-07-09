{
  /* menu section of a single kitchen */
}

import FoodCard from "./FoodCard";

function MenuSection({ title = "Recommended", foods = [], onOpenFoodReviews }) {
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">{title}</h2>

      <div
        className="grid gap-6 justify-start [grid-template-columns:repeat(auto-fit,minmax(270px,270px))]">
        {foods.map((food) => (
          <FoodCard
            key={food.id}
            {...food}
            menuId={food.id}
            onOpenReviews={onOpenFoodReviews}
          />
        ))}
      </div>
    </div>
  );
}

export default MenuSection;
