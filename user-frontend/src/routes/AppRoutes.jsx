import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "../landing_page/home/Home";
import About from "../landing_page/about/About";
import Cart from "../landing_page/cart/Cart";
import Checkout from "../landing_page/checkout/Checkout";
import Orders from "../landing_page/orders/Orders";
import Profile from "../landing_page/profile/Profile";
import Login from "../landing_page/auth/Login";
import Signup from "../landing_page/auth/Signup";
import VerifyEmailOtp from "../landing_page/auth/VerifyEmailOtp";
import NotFound from "../landing_page/NotFound";
import KitchenPage from "../landing_page/kitchen/KitchenPage";
import KitchensByFoodPage from "../features/food/kitchensByFoods/KitchensByFoodPage";
import ProtectedRoute from "./ProtectedRoute";

import { Footer, Navbar } from "../components/layout";
import TopAccessNotice from "../components/layout/TopAccessNotice";
import SearchResultsPage from "../components/search/SearchResultPage";

import ForgotPassword from "../landing_page/auth/ForgotPassword";
import ResetPassword from "../landing_page/auth/ResetPassword";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [accessNotice, setAccessNotice] = useState(null);
  const isAuthModal =
    location.pathname === "/login" || location.pathname === "/signup";
  const hideFooter =
    location.pathname === "/cart" ||
    location.pathname === "/profile" ||
    location.pathname.startsWith("/kitchen/") ||
    location.pathname.startsWith("/food/");
  const backgroundLocation = isAuthModal
    ? {
        ...location,
        pathname: "/",
        search: "",
        hash: "",
        state: null,
        key: "home-modal-background",
      }
    : location;

  useEffect(() => {
    if (!location.state?.authPrompt) {
      return;
    }

    setAccessNotice(location.state.authPrompt);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  return (
    <>
      {accessNotice && (
        <TopAccessNotice
          message={accessNotice.message}
          onClose={() => setAccessNotice(null)}
        />
      )}

      <Navbar />

      <Routes location={backgroundLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/food/:slug" element={<KitchensByFoodPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/kitchen/:id" element={<KitchenPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmailOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        

        <Route path="*" element={<NotFound />} />
      </Routes>

      {isAuthModal && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      )}

      {!hideFooter && <Footer />}
    </>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default AppRoutes;
