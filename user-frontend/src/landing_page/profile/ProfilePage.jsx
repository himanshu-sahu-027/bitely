import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./profilecomponents/Sidebar";
import Orders from "./profilecomponents/Orders/Orders";
import AddressList from "./profilecomponents/Addresses/AddressList";
import SubscriptionPage from "./profilecomponents/Subscription/SubscriptionPage";
import SettingsPage from "./profilecomponents/Settings/SettingsPage";
import EditProfileModal from "./profilecomponents/Profile/EditProfileModal";
import ProfileHeader from "./profilecomponents/Profile/ProfileHeader";
import buildProfileOrders from "./utils/buildProfileOrders";
import ordersData from "../../data/orders";
import orderItemsData from "../../data/orderItems";
import orderPricingData from "../../data/orderPricing";
import orderStatusHistoryData from "../../data/orderStatusHistory";
import kitchensData from "../../data/kitchens";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage({ initialTab = "orders" }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(76);
  const [isPanelPinned, setIsPanelPinned] = useState(false);
  const stickyPanelRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "Aarav Sharma",
    phone: user?.phone ?? "+91 98765 43210",
    email: user?.email ?? "aarav.sharma@bitelymail.com",
  });

  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      label: "Home",
      doorFlat: "B-1203",
      area: "Indiranagar 100 Feet Road",
      landmark: "Near Metro Station",
      fullAddress: "B-1203, Indiranagar 100 Feet Road, Near Metro Station, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038, India",
      displayAddress: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038, India",
      addressLine: "100 Feet Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      latitude: 12.9719,
      longitude: 77.6412,
    },
    {
      id: "addr-2",
      label: "College",
      doorFlat: "Hostel Block C",
      area: "Koramangala Industrial Layout",
      landmark: "Gate 2",
      fullAddress: "Hostel Block C, Koramangala Industrial Layout, Gate 2, Koramangala Industrial Layout, Bengaluru, Karnataka 560095, India",
      displayAddress: "Koramangala Industrial Layout, Bengaluru, Karnataka 560095, India",
      addressLine: "Koramangala Industrial Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560095",
      latitude: 12.9352,
      longitude: 77.6245,
    },
  ]);

  const ordersByStatus = useMemo(
    () =>
      buildProfileOrders({
        orders: ordersData,
        orderItems: orderItemsData,
        orderPricing: orderPricingData,
        orderStatusHistory: orderStatusHistoryData,
        kitchens: kitchensData,
        addresses,
      }),
    [addresses],
  );

  const subscriptions = useMemo(
    () => [
      {
        id: "sub-1",
        kitchenName: "Saffron Kitchen",
        planDetails: "Monthly Plan • 25% off on breakfast",
        benefits: ["Priority delivery slots", "Weekly menu recommendations", "Exclusive offers"],
      },
      {
        id: "sub-2",
        kitchenName: "Urban Bowl",
        planDetails: "Weekly Plan • Flat ₹50 off on bowls",
        benefits: ["Free add-ons (once/week)", "Early access to new items", "Save for later cuisines"],
      },
    ],
    [],
  );

  const handleReorder = (order) => {
    alert(`Reorder started for order #${order.orderId} (${order.kitchenName}).`);
  };

  const handleHelp = (order) => {
    alert(`Help requested for order #${order.orderId}.`);
  };

  const handlePay = (order) => {
    alert(`Payment started for order #${order.orderId}: Rs. ${order.totalPayable} (mock).`);
  };

  const handleCancel = (order) => {
    alert(`Cancellation requested for order #${order.orderId} (${order.kitchenName}).`);
  };

  useEffect(() => {
    const updateStickyState = () => {
      if (typeof window === "undefined") {
        return;
      }

      const navbar = document.querySelector(".navbar");
      const panel = stickyPanelRef.current;

      if (!navbar || !panel) {
        return;
      }

      const nextNavbarHeight = navbar.getBoundingClientRect().height;
      const panelTop = panel.getBoundingClientRect().top;
      const desktop = window.innerWidth >= 1024;

      setIsDesktopLayout(desktop);
      setNavbarHeight(nextNavbarHeight);
      setIsPanelPinned(desktop && panelTop <= nextNavbarHeight + 1);
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#eef3f7]">
      <ProfileHeader
        profile={profile}
        onEdit={() => setIsEditProfileOpen(true)}
      />

      <div className="mx-auto -mt-16 max-w-7xl px-4 pb-10 md:px-6 lg:min-h-[calc(100vh-4.75rem)]">
        <div
          ref={stickyPanelRef}
          className="rounded-none bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-10 lg:sticky lg:overflow-hidden"
          style={{
            top: isDesktopLayout ? `${navbarHeight}px` : undefined,
            height: isDesktopLayout ? `calc(100vh - ${navbarHeight}px)` : undefined,
          }}
        >
          <div className="grid gap-8 lg:h-full lg:grid-cols-12 lg:gap-0">
            <aside className="lg:col-span-3">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </aside>

            <main className="lg:col-span-9 lg:min-h-0">
              <div
                className={[
                  "min-h-[32rem] bg-white p-2 md:p-4 lg:h-full lg:min-h-0",
                  isPanelPinned ? "lg:overflow-y-auto" : "lg:overflow-visible",
                ].join(" ")}
              >
                {activeTab === "orders" && (
                  <Orders
                    activeOrders={ordersByStatus.active}
                    pastOrders={ordersByStatus.past}
                    onCancel={handleCancel}
                    onPay={handlePay}
                    onReorder={handleReorder}
                    onHelp={handleHelp}
                  />
                )}

                {activeTab === "subscriptions" && (
                  <SubscriptionPage subscriptions={subscriptions} />
                )}

                {activeTab === "addresses" && (
                  <AddressList
                    addresses={addresses}
                    onChange={(next) => setAddresses(next)}
                  />
                )}

                {activeTab === "settings" && (
                  <SettingsPage
                    onLogout={() => {
                      logout();
                      navigate("/", { replace: true });
                    }}
                    onDeleteAccount={() => {
                      logout();
                      navigate("/", { replace: true });
                    }}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {isEditProfileOpen && (
        <EditProfileModal
          open={isEditProfileOpen}
          profile={profile}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(nextProfile) => {
            setProfile(nextProfile);
            setIsEditProfileOpen(false);
          }}
        />
      )}
    </div>
  );
}
