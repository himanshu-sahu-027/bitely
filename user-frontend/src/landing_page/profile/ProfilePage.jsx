import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./profilecomponents/Sidebar";
import Orders from "./profilecomponents/Orders/Orders";
import AddressList from "./profilecomponents/Addresses/AddressList";
import SubscriptionPage from "./profilecomponents/Subscription/SubscriptionPage";
import SettingsPage from "./profilecomponents/Settings/SettingsPage";
import EditProfileModal from "./profilecomponents/Profile/EditProfileModal";
import ProfileHeader from "./profilecomponents/Profile/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  cancelOrder,
  fetchActiveOrders,
  fetchOrderHistory,
  reorderOrder,
} from "../../services/orderService";
import {
  createAddress,
  deleteCurrentUser,
  deleteAddress,
  fetchAddresses,
  fetchProfile,
  updateAddress,
  updateProfile,
} from "../../services/userService";

function normalizeAddress(address) {
  return {
    id: address._id || address.id,
    label: address.label || "Address",
    doorFlat: address.doorFlat || "",
    area: address.area || "",
    landmark: address.landmark || "",
    fullAddress:
      address.fullAddress ||
      [address.address_line || address.addressLine, address.city, address.state, address.pincode]
        .filter(Boolean)
        .join(", "),
    displayAddress:
      address.displayAddress ||
      [address.address_line || address.addressLine, address.city, address.state, address.pincode]
        .filter(Boolean)
        .join(", "),
    addressLine: address.address_line || address.addressLine || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    isDefault: Boolean(address.is_default || address.isDefault),
  };
}

export default function ProfilePage({ initialTab = "orders" }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(76);
  const [isPanelPinned, setIsPanelPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const stickyPanelRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.full_name || user?.name || "Bitely User",
    email: user?.email || "",
  });
  const [addresses, setAddresses] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({
    active: [],
    past: [],
  });

  const subscriptions = [];

  useEffect(() => {
    let ignore = false;

    async function loadProfilePage() {
      setIsLoading(true);
      setError("");

      try {
        const [profileResponse, addressResponse, activeOrdersResponse, historyResponse] =
          await Promise.all([
            fetchProfile(),
            fetchAddresses(),
            fetchActiveOrders(),
            fetchOrderHistory(),
          ]);

        if (ignore) {
          return;
        }

        setProfile({
          name:
            profileResponse.data?.full_name ||
            profileResponse.data?.name ||
            user?.name ||
            "Bitely User",
          email: profileResponse.data?.email || "",
        });
        setAddresses((addressResponse.data ?? []).map(normalizeAddress));
        setOrdersByStatus({
          active: activeOrdersResponse.data ?? [],
          past: historyResponse.data ?? [],
        });
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProfilePage();

    return () => {
      ignore = true;
    };
  }, []);

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

  const handleAddressChange = async ({ type, value, id }) => {
    try {
      if (type === "delete") {
        await deleteAddress(id);
        setAddresses((current) => current.filter((address) => address.id !== id));
        return;
      }

      const payload = {
        label: value.label,
        address_line: value.addressLine,
        city: value.city,
        state: value.state,
        pincode: value.pincode,
        latitude: value.latitude,
        longitude: value.longitude,
      };

      if (type === "edit") {
        const response = await updateAddress(value.id, payload);
        const nextAddress = normalizeAddress(response.data);
        setAddresses((current) =>
          current.map((address) => (address.id === nextAddress.id ? nextAddress : address)),
        );
        return;
      }

      const response = await createAddress(payload);
      setAddresses((current) => [normalizeAddress(response.data), ...current]);
    } catch (addressError) {
      window.alert(addressError.message);
    }
  };

  const handleReorder = (order) => {
    reorderOrder(order.orderId)
      .then(async (response) => {
        const availableItems = (response.data ?? []).filter((item) => item.available);

        for (const item of availableItems) {
          for (let count = 0; count < item.quantity; count += 1) {
            // Authenticated cart writes happen on the backend, so only the menu id is required here.
            // The server keeps the single-kitchen cart rule intact.
            await addToCart(null, {
              id: item.menu_id,
              name: item.latest_name || item.previous_name,
              price: item.latest_price || item.previous_price || 0,
              image: item.latest_image_url || "",
            });
          }
        }

        if (availableItems.length === 0) {
          window.alert("Those menu items are no longer available for reorder.");
          return;
        }

        navigate("/cart");
      })
      .catch((reorderError) => {
        window.alert(reorderError.message);
      });
  };

  const handleHelp = (order) => {
    window.alert(`Help requested for order #${order.orderId}.`);
  };

  const handlePay = (order) => {
    window.alert(
      `Order #${order.orderId} is still unpaid. New checkout payments now use real Razorpay from the checkout page.`,
    );
  };

  const handleCancel = (order) => {
    cancelOrder(order.orderId)
      .then(async () => {
        const [activeOrdersResponse, historyResponse] = await Promise.all([
          fetchActiveOrders(),
          fetchOrderHistory(),
        ]);

        setOrdersByStatus({
          active: activeOrdersResponse.data ?? [],
          past: historyResponse.data ?? [],
        });
      })
      .catch((cancelError) => {
        window.alert(cancelError.message);
      });
  };

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
                {isLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    Loading your profile data...
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                {!isLoading && !error && activeTab === "orders" ? (
                  <Orders
                    activeOrders={ordersByStatus.active}
                    pastOrders={ordersByStatus.past}
                    onCancel={handleCancel}
                    onPay={handlePay}
                    onReorder={handleReorder}
                    onHelp={handleHelp}
                  />
                ) : null}

                {!isLoading && !error && activeTab === "subscriptions" ? (
                  <SubscriptionPage subscriptions={subscriptions} />
                ) : null}

                {!isLoading && !error && activeTab === "addresses" ? (
                  <AddressList
                    addresses={addresses}
                    onChange={handleAddressChange}
                  />
                ) : null}

                {!isLoading && !error && activeTab === "settings" ? (
                  <SettingsPage
                    onLogout={async () => {
                      await logout();
                      navigate("/", { replace: true });
                    }}
                    onDeleteAccount={async () => {
                      try {
                        await deleteCurrentUser();
                        await logout({
                          skipRequest: true,
                          suppressErrorAlert: true,
                        });
                        window.alert("Your account has been deleted permanently.");
                        navigate("/", { replace: true });
                      } catch (deleteError) {
                        window.alert(deleteError.message);
                      }
                    }}
                  />
                ) : null}
              </div>
            </main>
          </div>
        </div>
      </div>

      {isEditProfileOpen ? (
        <EditProfileModal
          open={isEditProfileOpen}
          profile={profile}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={async (nextProfile) => {
            try {
              const response = await updateProfile({
                name: nextProfile.name,
              });

              setProfile({
                name: response.data?.full_name || response.data?.name || nextProfile.name,
                email: response.data?.email || nextProfile.email,
              });
              setIsEditProfileOpen(false);
            } catch (saveError) {
              window.alert(saveError.message);
            }
          }}
        />
      ) : null}
    </div>
  );
}
