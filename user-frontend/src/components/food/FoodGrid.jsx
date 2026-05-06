{/* food grid */}

import FoodCard from "./FoodCard"
import foods from "../../data/foods"


function FoodGrid() {
  return (

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4">

      {foods.map((food, index) => (

        <FoodCard key={index} {...food} />

      ))}

    </div>

  )
}

export default FoodGrid
