{/* Single food card in popular foods section */}

import { useNavigate } from "react-router-dom";

function PopularFoodItem({ food }) {
  const navigate = useNavigate();

  return (
    <div
      // Open the kitchens page for the selected food.
      onClick={() => navigate(`/food/${food.slug}`)}
      className="flex flex-col items-center min-w-[140px] cursor-pointer group perspective hover:z-10 ml-10"
    >
      <div
        className="
        transform transition-all duration-500 ease-out
        group-hover:rotate-x-8 group-hover:-rotate-y-12 group-hover:scale-110
        "
      >
        <img
          src={food.image}
          alt={food.name}
          className="w-80 h-24 object-contain drop-shadow-sm"
        />
      </div>

      <p className="mt-3 text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300 ">
        {food.name}
      </p>
    </div>
  );
}

export default PopularFoodItem;
