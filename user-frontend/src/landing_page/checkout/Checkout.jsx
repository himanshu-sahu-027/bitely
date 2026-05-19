import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import DummyRazorpayGatewayModal from "../../components/payment/DummyRazorpayGatewayModal";
import PaymentButton from "../../components/payment/PaymentButton";
import PaymentSuccessOverlay from "../../components/payment/PaymentSuccessOverlay";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  dummyCustomerProfile,
  dummyDeliveryAddresses,
} from "../../data/dummyPaymentData";
import { useRazorpayCheckout } from "../../hooks/useRazorpayCheckout";
import {
  buildDummyRazorpayResponse,
  dummyCreatePaymentOrder,
  dummyVerifyPayment,
} from "../../services/dummyPaymentService";
import { saveDummyOrder } from "../../services/dummyOrderStore";

const DELIVERY_FEE = 30;
const GST_RATE = 0.05;
const USE_DUMMY_PAYMENT =
  String(import.meta.env.VITE_USE_DUMMY_PAYMENT || "true").toLowerCase() ===
  "true";

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

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { openRazorpayCheckout } = useRazorpayCheckout();
  const redirectTimeoutRef = useRef(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ONLINE");
  const [selectedAddressId, setSelectedAddressId] = useState(
    dummyDeliveryAddresses[0]?.id || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showDummyGateway, setShowDummyGateway] = useState(false);
  const [dummyGatewayOrder, setDummyGatewayOrder] = useState(null);
  const [selectedGatewayOption, setSelectedGatewayOption] = useState("upi");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [paymentState, setPaymentState] = useState({
    type: "info",
    title: "Test mode enabled",
    description:
      "This checkout uses dummy simulation by default. Razorpay popup code is ready for test mode when you connect the backend later.",
  });
  const [latestOrder, setLatestOrder] = useState(null);

  const itemTotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart.items],
  );
  const gst = Math.round(itemTotal * GST_RATE);
  const discount = cart.coupon?.applied ? cart.coupon.discount : 0;
  const totalAmount = itemTotal + DELIVERY_FEE + gst - discount;
  const packagingFee = 0;
  const platformFee = 0;

  const selectedAddress = dummyDeliveryAddresses.find(
    (address) => address.id === selectedAddressId,
  );

  const isCartEmpty = cart.items.length === 0;
  const kitchenName = cart.restaurant?.name || "Bitely Kitchen";
  const kitchenImage = cart.restaurant?.image || "";

  const checkoutPayload = {
    user: user?._id || user?.id || "dummy-user",
    items: cart.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      kitchenName,
      kitchenImage,
    })),
    totalAmount,
    paymentMethod: selectedPaymentMethod,
    deliveryAddress: selectedAddress,
  };

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const persistDummyOrder = (order, paymentStatus, paymentMethod) => {
    saveDummyOrder({
      order: {
        ...order,
        kitchenName,
        kitchenImage,
        placedAt: new Date().toISOString(),
      },
      items: checkoutPayload.items,
      pricing: {
        itemTotal,
        packagingFee,
        platformFee,
        discount,
        deliveryFee: DELIVERY_FEE,
        tax: gst,
        finalTotal: totalAmount,
      },
      paymentMethod,
      paymentStatus,
    });
  };

  const startOrdersRedirect = (orderId) => {
    setShowSuccessOverlay(true);
    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate("/orders", {
        state: { justPlacedOrderId: orderId },
      });
    }, 2200);
  };

  const handleCodOrder = async () => {
    const response = await dummyCreatePaymentOrder(checkoutPayload);

    persistDummyOrder(response.data.order, "pending", "COD");
    setLatestOrder(response.data.order);
    setPaymentState({
      type: "success",
      title: "COD order placed",
      description:
        "Your Cash on Delivery order was created successfully in dummy mode.",
    });
    clearCart();
    startOrdersRedirect(response.data.order.id);
  };

  const handleOnlineVerification = async (order, razorpayResponse) => {
    const verification = await dummyVerifyPayment({
      orderId: order.id,
      razorpayOrderId: razorpayResponse.razorpay_order_id,
    });

    setLatestOrder({
      ...order,
      paymentMethod: selectedGatewayOption.toUpperCase(),
      paymentStatus: verification.data.order.paymentStatus,
      razorpayPaymentId: verification.data.order.razorpayPaymentId,
    });
    persistDummyOrder(
      {
        ...order,
        razorpayPaymentId: verification.data.order.razorpayPaymentId,
      },
      "paid",
      selectedGatewayOption.toUpperCase(),
    );
    setPaymentState({
      type: "success",
      title: "Online payment successful",
      description:
        `Payment completed with ${selectedGatewayOption.toUpperCase()}. Redirecting to your orders page.`,
    });
    setShowDummyGateway(false);
    clearCart();
    startOrdersRedirect(order.id);
  };

  const handleOnlineOrder = async () => {
    const response = await dummyCreatePaymentOrder(checkoutPayload);
    const { order, razorpayOrder, keyId } = response.data;

    if (USE_DUMMY_PAYMENT) {
      setDummyGatewayOrder({
        order,
        razorpayOrder,
      });
      setShowDummyGateway(true);
      setIsLoading(false);
      return;
    }

    await openRazorpayCheckout({
      key: keyId,
      amount: razorpayOrder.amount,
      orderId: razorpayOrder.id,
      customer: {
        name: user?.name || dummyCustomerProfile.name,
        email: user?.email || dummyCustomerProfile.email,
        contact: user?.phone || dummyCustomerProfile.contact,
      },
      onSuccess: async (razorpayResponse) => {
        try {
          await handleOnlineVerification(order, razorpayResponse);
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
  };

  const handlePlaceOrder = async () => {
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
      title: "Processing payment",
      description: "Please wait while we prepare your test checkout.",
    });

    try {
      if (selectedPaymentMethod === "COD") {
        await handleCodOrder();
      } else {
        await handleOnlineOrder();
      }
    } catch (error) {
      setPaymentState({
        type: "error",
        title: "Checkout failed",
        description: error.message || "Something went wrong during checkout.",
      });
    } finally {
      if (USE_DUMMY_PAYMENT || selectedPaymentMethod === "COD") {
        setIsLoading(false);
      }
    }
  };

  const handleDummyGatewayPayment = async () => {
    if (!dummyGatewayOrder) {
      return;
    }

    setIsLoading(true);

    try {
      const simulatedResponse = buildDummyRazorpayResponse(
        dummyGatewayOrder.razorpayOrder.id,
      );

      await handleOnlineVerification(dummyGatewayOrder.order, simulatedResponse);
    } catch (error) {
      setPaymentState({
        type: "error",
        title: "Payment failed",
        description: error.message || "Dummy payment could not be completed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCartEmpty && !latestOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-3 text-slate-600">
            Add a few dishes first, then come back here to test COD and Razorpay checkout.
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
                Choose a delivery address and test payment method for Bitely.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Delivery address</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {dummyDeliveryAddresses.map((address) => {
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
                      <p className="mt-2 text-sm text-slate-600">{address.fullName}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {address.addressLine}, {address.city}, {address.state} - {address.pincode}
                      </p>
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
                    title: "Razorpay Test Mode",
                    description:
                      "Use Razorpay test checkout flow. Dummy mode is enabled until backend wiring is connected.",
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
                <h2 className="text-xl font-semibold text-slate-900">Latest test order</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>Order ID: {latestOrder.id}</p>
                  <p>Payment method: {latestOrder.paymentMethod}</p>
                  <p>Payment status: {latestOrder.paymentStatus || "pending"}</p>
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
                  <span>{formatCurrency(DELIVERY_FEE)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                <div className="flex items-center justify-between text-blue-500">
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
                  disabled={isCartEmpty}
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
      <DummyRazorpayGatewayModal
        open={showDummyGateway}
        amount={totalAmount}
        selectedOption={selectedGatewayOption}
        onSelectOption={setSelectedGatewayOption}
        onClose={() => setShowDummyGateway(false)}
        onPay={handleDummyGatewayPayment}
        loading={isLoading}
      />
      <PaymentSuccessOverlay
        open={showSuccessOverlay}
        title="Payment Successful"
        description="Your Bitely order is confirmed. Redirecting to your orders page."
        redirectLabel="Opening orders"
      />
    </>
  );
}
