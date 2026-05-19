import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import CartItemCard from "./cartComponents/CartItemCard";
import CartBillSummary from "./cartComponents/CartBillSummary.jsx";
import CartCheckoutBar from "./cartComponents/CartCheckoutBar.jsx";
import CartCouponBox from "./cartComponents/CartCouponBox.jsx";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const itemTotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const DELIVERY_FEE = 30;
  const GST_RATE = 0.05;
  const gst = Math.round(itemTotal * GST_RATE);
  const discount = cart.coupon?.applied ? cart.coupon.discount : 0

const total = itemTotal + DELIVERY_FEE + gst - discount
 

  const isCartEmpty = cart.items.length === 0;
  const canCheckout = !isCartEmpty;

  const handleOrderNow = () => {
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Cart</h1>

      {cart.items.length === 0 ? (
        <p className="mt-6 text-slate-600">Cart is empty</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-t from-teal-50 via-sky-100 to-indigo-100 p-5 shadow-sm">
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={cart.restaurant?.image}
                    alt={cart.restaurant?.name || "Kitchen"}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-indigo-800">
                      {cart.restaurant?.name}
                    </h2>
                    <p className="mt-1 text-base text-zinc-600">
                      {cart.restaurant?.address}
                    </p>
                    
                  </div>
                </div>

                <div className="mt-5 h-px w-full bg-black" />
              </div>

              <div className="mt-5 space-y-4">
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onIncrease={() => updateQuantity(item.id, +1)}
                    onDecrease={() => updateQuantity(item.id, -1)}
                    onRemove={() => removeItem(item.id)}
                    formatINR={(value) => `Rs. ${value}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <CartCouponBox
                coupon={cart.coupon}
                disabled={isCartEmpty}
                onApply={(code) => applyCoupon(code, itemTotal)}
                onRemove={removeCoupon}
                formatINR={(value) => `Rs. ${value}`}
              />

              <CartBillSummary
                itemTotal={itemTotal}
                deliveryFee={DELIVERY_FEE}
                platformFee={0}
                gst={gst}
                discount={discount}
                toPay={total}
                savings={discount}
                formatINR={(value) => `Rs. ${value}`}
              />
            </div>
          </div>

          <CartCheckoutBar
            totalLabel={`Rs. ${total}`}
            disabled={!canCheckout}
            isEmpty={isCartEmpty}
            restaurantClosed={false}
            pricePulse={false}
            savingsLabel=""
            onOrderNow={handleOrderNow}
          />
        </>
      )}
    </div>
  );
}
