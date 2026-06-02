import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PaymentButton from "../../components/payment/PaymentButton";
import PaymentSuccessOverlay from "../../components/payment/PaymentSuccessOverlay";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useRazorpayCheckout } from "../../hooks/useRazorpayCheckout";
import { createPaymentOrder, verifyPayment } from "../../services/paymentService";
import { fetchAddresses } from "../../services/userService";

function formatCurrency(value) {
  return `Rs. ${value}`;
}

function StatusBanner({ type, title, description }) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[type] || styles.info}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}

function normalizeAddress(address) {
  return {
    id: address._id || address.id,
    label: address.label || "Address",
    addressLine: address.address_line || address.addressLine || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    fullAddress:
      address.fullAddress ||
      [address.address_line || address.addressLine, address.city, address.state, address.pincode]
        .filter(Boolean)
        .join(", "),
    isDefault: Boolean(address.is_default || address.isDefault),
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart, isCartLoading } = useCart();
  const { openRazorpayCheckout } = useRazorpayCheckout();
  const redirectTimeoutRef = useRef(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ONLINE");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [paymentState, setPaymentState] = useState({
    type: "info",
    title: "Ready to place your order",
    description:
      "Choose a saved address and payment method. Razorpay verification now happens through the backend.",
  });
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadAddresses() {
      if (!isAuthenticated) {
        setAddresses([]);
        setSelectedAddressId("");
        return;
      }

      try {
        const response = await fetchAddresses();
        const nextAddresses = (response.data ?? []).map(normalizeAddress);

        if (!ignore) {
          setAddresses(nextAddresses);
          const defaultAddress =
            nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
          setSelectedAddressId(defaultAddress?.id || "");
        }
      } catch (error) {
        if (!ignore) {
          setPaymentState({
            type: "error",
            title: "Could not load addresses",
            description: error.message,
          });
        }
      }
    }

    loadAddresses();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const pricing = cart.pricing || {};
  const itemTotal = pricing.itemTotal || 0;
  const deliveryFee = pricing.deliveryFee || 0;
  const gst = pricing.gst || 0;
  const discount = pricing.discount || 0;
  const totalAmount = pricing.total || 0;
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const isCartEmpty = cart.items.length === 0;

  const checkoutPayload = useMemo(
    () => ({
      items: cart.items.map((item) => ({
        menuId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        kitchenId: cart.restaurant?.id,
        kitchenName: cart.restaurant?.name,
        kitchenImage: cart.restaurant?.image,
      })),
      totalAmount,
      paymentMethod: selectedPaymentMethod,
      deliveryAddress: selectedAddress
        ? {
            addressLine: selectedAddress.addressLine,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            latitude: selectedAddress.latitude,
            longitude: selectedAddress.longitude,
            label: selectedAddress.label,
            fullAddress: selectedAddress.fullAddress,
          }
        : null,
    }),
    [cart.items, cart.restaurant, selectedAddress, selectedPaymentMethod, totalAmount],
  );

  const startOrdersRedirect = (orderId) => {
    setShowSuccessOverlay(true);
    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate("/orders", {
        state: { justPlacedOrderId: orderId },
      });
    }, 2200);
  };

  const handleVerifiedPayment = async (order, razorpayResponse) => {
    const verification = await verifyPayment({
      orderId: order._id || order.id,
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature,
    });

    const verifiedOrder = verification.data.order;
    setLatestOrder(verifiedOrder);
    setPaymentState({
      type: "success",
      title: "Online payment successful",
      description: "Razorpay payment was verified on the server and your order is confirmed.",
    });
    await clearCart();
    startOrdersRedirect(verifiedOrder._id || verifiedOrder.id);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location,
        },
      });
      return;
    }

    if (isCartEmpty || !selectedAddress) {
      setPaymentState({
        type: "error",
        title: "Checkout incomplete",
        description: "Add items and choose a delivery address before continuing.",
      });
      return;
    }

    setIsLoading(true);
    setPaymentState({
      type: "info",
      title: "Processing order",
      description: "Please wait while we create your order.",
    });

    try {
      const response = await createPaymentOrder(checkoutPayload);
      const order = response.data.order;
      setLatestOrder(order);

      if (selectedPaymentMethod === "COD") {
        setPaymentState({
          type: "success",
          title: "COD order placed",
          description: "Your order was saved successfully and will be paid at delivery time.",
        });
        await clearCart();
        startOrdersRedirect(order._id || order.id);
        return;
      }

      await openRazorpayCheckout({
        key: response.data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.razorpayOrder.amount,
        orderId: response.data.razorpayOrder.id,
        customer: {
          name: user?.full_name || user?.name || "Bitely Customer",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        onSuccess: async (razorpayResponse) => {
          try {
            await handleVerifiedPayment(order, razorpayResponse);
          } catch (error) {
            setPaymentState({
              type: "error",
              title: "Verification failed",
              description: error.message,
            });
          } finally {
            setIsLoading(false);
          }
        },
        onFailure: (error) => {
          setPaymentState({
            type: "error",
            title: "Payment failed",
            description: error.message,
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      setPaymentState({
        type: "error",
        title: "Checkout failed",
        description: error.message || "Something went wrong during checkout.",
      });
      setIsLoading(false);
    }
  };

  if ((isCartEmpty || isCartLoading) && !latestOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            {isCartLoading ? "Loading your cart" : "Your cart is empty"}
          </h1>
          <p className="mt-3 text-slate-600">
            {isCartLoading
              ? "Please wait while we fetch your latest cart from the backend."
              : "Add a few dishes first, then come back here to place your order."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
              <p className="mt-2 text-sm text-slate-600">
                Choose a delivery address and payment method for your Bitely order.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Delivery address</h2>
              {!isAuthenticated ? (
                <p className="mt-4 text-sm text-slate-600">
                  Please log in to load your saved addresses.
                </p>
              ) : null}
              {isAuthenticated && addresses.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  No saved address found yet. Add one from your profile before placing an order.
                </div>
              ) : null}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {addresses.map((address) => {
                  const isActive = address.id === selectedAddressId;

                  return (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        isActive
                          ? "border-indigo-800 bg-indigo-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300",
                      ].join(" ")}
                    >
                      <p className="font-semibold text-slate-900">{address.label}</p>
                      <p className="mt-2 text-sm text-slate-600">{address.fullAddress}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Payment method</h2>
              <div className="mt-4 space-y-3">
                {[
                  {
                    id: "COD",
                    title: "Cash on Delivery",
                    description: "Place the order now and collect payment at delivery time.",
                  },
                  {
                    id: "ONLINE",
                    title: "Razorpay",
                    description:
                      "Open the real Razorpay checkout popup and verify the payment on the backend.",
                  },
                ].map((method) => {
                  const isActive = selectedPaymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={[
                        "flex w-full items-start justify-between rounded-2xl border p-4 text-left transition",
                        isActive
                          ? "border-indigo-700 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300",
                      ].join(" ")}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{method.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{method.description}</p>
                      </div>
                      <span
                        className={[
                          "mt-1 h-5 w-5 rounded-full border-2",
                          isActive ? "border-indigo-600 bg-indigo-500" : "border-slate-300",
                        ].join(" ")}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <StatusBanner
              type={paymentState.type}
              title={paymentState.title}
              description={paymentState.description}
            />

            {latestOrder ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Latest order</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>Order ID: {latestOrder._id || latestOrder.id}</p>
                  <p>Payment method: {latestOrder.paymentMethod || latestOrder.payment_method}</p>
                  <p>Payment status: {latestOrder.paymentStatus || latestOrder.payment_status || "pending"}</p>
                  <p>Razorpay order ID: {latestOrder.razorpayOrderId || "Not required for COD"}</p>
                  <p>Razorpay payment ID: {latestOrder.razorpayPaymentId || "Will appear after payment"}</p>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <div className="mt-5 space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-slate-300">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p>{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Item total</span>
                  <span>{formatCurrency(itemTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery fee</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                <div className="flex items-center justify-between text-blue-300">
                  <span>Discount</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold">
                  <span>To pay</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-6">
                <PaymentButton
                  loading={isLoading}
                  disabled={isCartEmpty || isCartLoading}
                  onClick={handlePlaceOrder}
                >
                  {selectedPaymentMethod === "COD"
                    ? "Place COD order"
                    : "Pay with Razorpay"}
                </PaymentButton>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PaymentSuccessOverlay
        open={showSuccessOverlay}
        title="Payment Successful"
        description="Your Bitely order is confirmed. Redirecting to your orders page."
        redirectLabel="Opening orders"
      />
    </>
  );
}
