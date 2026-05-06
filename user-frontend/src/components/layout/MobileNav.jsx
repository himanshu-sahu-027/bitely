import { Link } from "react-router-dom"
import { Home,  ShoppingCart, User, Search } from "lucide-react";

function MobileNav() {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t shadow-lg md:hidden">

      <div className="flex justify-around py-3 text-gray-600">

        <Link to="/" className="flex flex-col items-center text-sm">
          <Home />
          Home
        </Link>

        <Link to="/orders" className="flex flex-col items-center text-sm">
          <Search />
          Search
        </Link>

        <Link to="/chat" className="flex flex-col items-center text-sm">
          <ShoppingCart />
          Cart
        </Link>

        <Link to="/profile" className="flex flex-col items-center text-sm">
          <User />
          Profile
        </Link>

      </div>

    </div>
  )
}

export default MobileNav