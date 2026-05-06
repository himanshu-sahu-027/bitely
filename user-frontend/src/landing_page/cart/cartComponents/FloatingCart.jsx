import { useCart } from "../../../context/useCart"
import { Link } from "react-router-dom"

function FloatingCart() {

  const { cart } = useCart()
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (itemCount === 0) return null

  return (

    <div className="fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-6 rounded-full bg-indigo-600 px-6 py-3 text-white shadow-lg md:flex">

      <span>{itemCount} items</span>

      <span>₹{total}</span>

      <Link
        to="/cart"
        className="bg-white text-indigo-600 px-4 py-1 rounded-full font-semibold"
      >
        View Cart
      </Link>

    </div>

  )
}

export default FloatingCart
