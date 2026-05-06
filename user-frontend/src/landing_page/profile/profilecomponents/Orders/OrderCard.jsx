import { useState } from "react";
import { Check } from "lucide-react";
import OrderViewDetailsDrawer from "./ViewDetails/OrderViewDetailsDrawer";

function OrderCard({ order, onReorder, onCancel, onPay }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const displayOrderId = order.orderId ?? order.id ?? "N/A";

  const isActive = ["placed", "preparing", "out_for_delivery"].includes(
    order.status,
  );

  const formatDateTime = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColor = {
    placed: "text-orange-500",
    preparing: "text-yellow-500",
    out_for_delivery: "text-blue-500",
    delivered: "text-emerald-500",
    cancelled: "text-red-500",
  };

  return (
    <>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5">
        {/* Top Row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="text-xs text-slate-600">
            Order{" "}
            <span className="font-semibold text-slate-700">
              #{displayOrderId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 md:justify-end md:text-right">
            {isActive ? (
              <span
                className={`font-semibold capitalize ${
                  statusColor[order.status] || "text-primary"
                }`}
              >
                {order.status.replaceAll("_", " ")}
              </span>
            ) : (
              <>
                <span>Delivered on {formatDateTime(order.deliveredAt)}</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={10} strokeWidth={3} className="text-white" />
                </span>
              </>
            )}
          </div>
        </div>

        {/* Main Section */}
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start">
          {/* Left: Kitchen Info */}
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <img
              src={order.image}
              alt={order.kitchenName}
              className="h-16 w-16 flex-shrink-0 rounded-2xl border border-slate-100 object-cover"
            />

            <div className="min-w-0">
              <div className="truncate text-base font-bold text-slate-900">
                {order.kitchenName}
              </div>

              <div className="truncate text-sm text-slate-600">
                {order.location}
              </div>
              <div className="text-xs text-slate-500">
                {formatDateTime(order.placedAt)}
              </div>
            </div>
          </div>

          {/* Middle: Items (Desktop) */}
          <div className="hidden md:block md:w-[34%]">
            <div className="text-sm font-semibold text-slate-800">Items</div>

            <div className="mt-2 space-y-1">
              {order.items?.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex gap-2 text-sm text-slate-700"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0 text-slate-500">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Payment + Actions */}
          <div className="w-full md:w-[26%] md:text-right">
            {/* Payment */}
            {order.paymentStatus !== "paid" ? (
              <button
                type="button"
                onClick={() => onPay?.(order)}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary via-secondary to-indigo-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:opacity-90 md:w-auto"
              >
                Pay ₹{order.totalAmount}
              </button>
            ) : (
              <div className="inline-flex justify-end">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
                  Paid ₹{order.totalAmount}
                </div>
              </div>
            )}

            {/* View Details */}
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="mt-3 block text-sm font-semibold uppercase tracking-wide text-primary transition hover:opacity-80 md:ml-auto"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Items (Mobile) */}
        <div className="mt-4 md:hidden">
          <div className="text-sm font-semibold text-slate-800">Items</div>

          <div className="mt-2 space-y-1">
            {order.items?.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex gap-2 text-sm text-slate-700"
              >
                <span className="truncate">{item.name}</span>
                <span className="shrink-0 text-slate-500">
                  x{item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {isActive && order.paymentStatus !== "paid" ? (
            <button
              type="button"
              onClick={() => onCancel?.(order)}
              className="rounded-xl border border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancel Order
            </button>
          ) : !isActive ? (
            <button
              type="button"
              onClick={() => onReorder?.(order)}
              className="rounded-xl border border-indigo-700 bg-white px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-slate-100"
            >
              Reorder
            </button>
          ) : null}
        </div>
      </article>

      {/* Drawer */}
      <OrderViewDetailsDrawer
        open={detailsOpen}
        order={order}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}

export default OrderCard;
