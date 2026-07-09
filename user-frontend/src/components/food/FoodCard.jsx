import { FaMinus, FaPlus, FaStar } from "react-icons/fa";

import { useCart } from "../../context/CartContext";
import dummyFoodImg from "../../assets/images/dummy_food_img.png";

function FoodCard({
  id,
  menuId,
  name,
  image,
  price,
  rating,
  kitchen,
  onOpenReviews,
}) {
  const { cart, addToCart, removeFromCart } = useCart();

  const cartItem = cart.items.find((item) => item.id === id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(kitchen, { id, name, price, image });
  };

  const increase = () => {
    addToCart(kitchen, { id, name, price, image });
  };

  const decrease = () => {
    removeFromCart(id);
  };


  return (
    <div className="w-[270px] overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:bg-blue-50 hover:shadow-[10px_10px_15px_-10px_rgba(65,105,225,0.8)]">
      <div className="relative">
        <img
          src={image || dummyFoodImg}
          onError={(event) => {
            event.currentTarget.src = dummyFoodImg;
          }}
          alt={name}
          className="h-40 w-full object-cover"
        />

        <div className="absolute left-2 top-2 flex items-center rounded bg-white px-2 py-1 text-xs shadow">
          <FaStar className="mr-1 text-yellow-400" />
          {rating}
        </div>

        {menuId && onOpenReviews ? (
          <button
            type="button"
            onClick={() => onOpenReviews({ menuId, name })}
            className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-950"
          >
            See Reviews
          </button>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">{kitchen?.name}</p>
        <p className="text-xs text-gray-400">
          {kitchen?.deliveryTime} delivery
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="font-bold text-indigo-600">₹{price}</p>

          {qty === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-sm text-white"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-4 rounded-full bg-fuchsia-700 px-2 py-1 text-white">
              <button type="button" onClick={decrease}>
                <FaMinus size={10} />
              </button>

              <span className="text-sm">{qty}</span>

              <button type="button" onClick={increase}>
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
