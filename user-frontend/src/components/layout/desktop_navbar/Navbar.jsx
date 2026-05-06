import { Link, useLocation } from "react-router-dom";
import { Home, Info, ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import logo from "../../../assets/logo/logo.png";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Cart", path: "/cart", icon: ShoppingCart },
  ];

  return (
    <div className="navbar">
      <div className="navbar-container ">
        {/* Logo */}
        <Link to="/" className="logo-wrapper">
          <img src={logo} alt="Bitely" className="navbar-logo" />

          <span className="logo-text ">Bitely</span>
        </Link>

        {/* search bar */}
        <div className="navbar-search">
          <Search size={18} className="search-icon" />

          <input
            type="text"
            placeholder="Search food or kitchen..."
            className="search-input"
          />
        </div>

        {/* Navigation */}
        <div className="navbar-links py-3 ">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item ${active ? "nav-active" : ""}`}
              >
                {item.name === "Cart" ? (
                  <div className="cart-icon-wrapper">
                    <Icon size={19} className="nav-icon" />

                    {!active && totalQuantity > 0 && (
                      <span className="cart-badge">{totalQuantity}</span>
                    )}
                  </div>
                ) : (
                  <Icon size={19} className="nav-icon" />
                )}
                {item.name}

                <span className="nav-underline"></span>
              </Link>
            );
          })}

          {/* log in */}
          {!isAuthenticated && (
            <Link to="/login" className="login-btn">
              Log in
            </Link>
          )}

          {/* Profile */}
          <Link to="/profile" className="profile-btn" aria-label="Profile">
              <User size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
