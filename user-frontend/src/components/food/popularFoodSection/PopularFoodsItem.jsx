{/* Single food card in popular foods section */}

import { useNavigate } from "react-router-dom";
import PopularFoodItemImg from "../../../assets/images/PopularFoodItem.png";

function PopularFoodItem({ food }) {
  const navigate = useNavigate();

  return (
    <div
      // Open the kitchens page for the selected food.
      onClick={() => navigate(`/food/${food.slug}`)}
      className="flex flex-col items-center flex-none cursor-pointer group perspective hover:z-10 px-2 w-1/2 sm:w-1/3 md:w-1/4 lg:w-[18%] xl:w-[15%]"
    >
      <div
        className="
        transform transition-all duration-500 ease-out
        group-hover:rotate-x-8 group-hover:-rotate-y-12 group-hover:scale-110
        "
      >
        <img
          src={food.image || PopularFoodItemImg}
          onError={(event) => {
            event.currentTarget.src = PopularFoodItemImg;
          }}
          alt={food.name}
          className="w-full max-w-[20rem] h-28 sm:h-32 md:h-36 object-contain drop-shadow-sm"
        />
      </div>

      <p className="mt-3 text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300 text-center">
        {food.name}
      </p>
    </div>
  );
}

export default PopularFoodItem;
