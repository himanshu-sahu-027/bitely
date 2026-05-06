{/* menu section of a single kitchen */}

import FoodCard from "./FoodCard"

function MenuSection({ title = "Recommended", foods = [] }) {

  return (

    <div className="p-4">

      <h2 className="text-lg font-bold mb-4">
        {title}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {foods.map((food) => (

          <FoodCard key={food.id} {...food} />

        ))}

      </div>

    </div>

  )
}

export default MenuSection
