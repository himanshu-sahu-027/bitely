{/* Single food item card  */}

import { useState } from "react";
import { FaStar, FaPlus, FaMinus } from "react-icons/fa"
import { useCart } from "../../context/CartContext"
import dummyFoodImg from "../../assets/images/dummy_food_img.png"
import FoodReviewList from "../review/FoodReviewList"

function FoodCard({
  id,
  menuId,
  name,
  image,
  price,
  rating,
  kitchen,
}) {
  const { cart, addToCart, removeFromCart } = useCart()
  const [showReviews, setShowReviews] = useState(false);

  // Find this food item inside the shared cart.
  const cartItem = cart.items.find((item) => item.id === id)
  const qty = cartItem ? cartItem.quantity : 0

  const handleAdd = () => {
    // Add this food to cart with simple item details.
    addToCart(kitchen, { id, name, price, image })
  }

  const increase = () => {
    addToCart(kitchen, { id, name, price, image })
  }

  const decrease = () => {
    // Remove one quantity from cart.
    removeFromCart(id)
  }

  return (

    <div className="w-[270px] bg-white hover:bg-blue-50 rounded-xl shadow-md overflow-hidden hover:shadow-[10px_10px_15px_-10px_rgba(65,105,225,0.8)] transition-all duration-300">

      {/* Food Image */}

      <div className="relative">

        <img
          src={image || dummyFoodImg}
          onError={(event) => {
            event.currentTarget.src = dummyFoodImg;
          }}
          alt={name}
          className="w-full h-40 object-cover"
        />

        {/* Rating Badge */}

        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded flex items-center text-xs shadow">

          <FaStar className="text-yellow-400 mr-1" />

          {rating}

        </div>

      </div>

      {/* Content */}

      <div className="p-4">

        <h3 className="font-semibold text-lg">{name}</h3>

        <p className="text-sm text-gray-500">{kitchen?.name}</p>

        <p className="text-xs text-gray-400">{kitchen?.deliveryTime} delivery</p>

        {menuId ? (
          <button
            type="button"
            onClick={() => setShowReviews((v) => !v)}
            className="mt-2 w-full border px-3 py-1.5 rounded text-sm hover:bg-gray-50"
          >
            {showReviews ? "Hide Reviews" : "View Reviews"}
          </button>
        ) : null}

        {menuId && showReviews ? <FoodReviewList menuId={menuId} /> : null}

        <div className="flex justify-between items-center mt-3">

          <p className="font-bold text-indigo-600">₹{price}</p>

          {/* Add / Quantity Button */}

          {qty === 0 ? (

            <button
              type="button"
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm"
            >
              Add
            </button>

          ) : (

            <div className="flex items-center gap-4 bg-fuchsia-700 text-white px-2 py-1 rounded-full">

              <button type="button" onClick={decrease}>
                <FaMinus size={10}/>
              </button>

              <span className="text-sm">{qty}</span>

              <button type="button" onClick={increase}>
                <FaPlus size={10}/>
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default FoodCard
