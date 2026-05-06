import { Check, MapPin } from "lucide-react";
import { createPortal } from "react-dom";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  return currencyFormatter.format(value ?? 0);
}

function formatDeliveredAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderViewDetailsDrawer({ open, order, onClose }) {
  if (!open || !order) {
    return null;
  }

  const charges = [
    { label: "Item Total", value: order.itemTotal ?? 0 },
    { label: "Restaurant Packaging", value: order.packagingFee ?? 0 },
    { label: "Platform Fee", value: order.platformFee ?? 0 },
    {
      label: order.discountLabel ?? "Discount Applied",
      value: -(order.discountAmount ?? 0),
      tone: "text-emerald-600",
    },
    {
      label: "Delivery Fee",
      value: order.deliveryFee ?? 0,
      display: (order.deliveryFee ?? 0) === 0 ? "FREE" : formatMoney(order.deliveryFee),
    },
    { label: "Taxes", value: order.taxes ?? 0 },
  ];

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close order details"
        className="absolute inset-0 bg-slate-950/45"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-screen w-full max-w-[34rem] flex-col overflow-hidden bg-white opacity-100 shadow-2xl">
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-base font-bold text-slate-950">
            Order #{order.orderId}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:self-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-wide">Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain bg-white px-6 pb-6 pt-4 pr-8 text-sm leading-5">
          <div className="space-y-3.5">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300">
                  <MapPin size={16} className="text-slate-800" />
                </div>
                <div className="h-8 border-l border-dashed border-slate-300" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950">{order.kitchenName}</div>
                <div className="mt-0.5 text-sm text-slate-600">{order.location}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300">
                <MapPin size={16} className="text-slate-800" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950">
                  {order.deliveryAddressLabel}
                </div>
                <div className="mt-0.5 text-sm text-slate-600">{order.deliveryAddress}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3.5">
            <div className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                <Check size={11} strokeWidth={3} className="text-white" />
              </div>
              <div className="text-slate-700">
                Delivered on {formatDeliveredAt(order.deliveredAt)}
                {order.deliveredBy ? ` by ${order.deliveredBy}` : ""}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3.5">
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {order.items.length} items
            </div>

            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {item.name} x {item.qty}
                  </div>
                  <div className="shrink-0 text-sm text-slate-800">
                    {formatMoney(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3.5">
            <div className="space-y-2">
              {charges.map((charge) => (
                <div key={charge.label} className="flex items-start justify-between gap-4 text-sm">
                  <div className={charge.tone ?? "text-slate-700"}>{charge.label}</div>
                  <div className={charge.tone ?? "text-slate-800"}>
                    {charge.display ?? formatMoney(charge.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-900 bg-white pb-8 pt-3.5">
            <div className="flex items-end justify-between gap-4">
              <div className="text-sm text-slate-600">{order.paymentMethod}</div>
              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bill Total
                </div>
                <div className="text-base font-bold text-slate-950">
                  {formatMoney(order.paymentCompleted ? order.totalPaid : order.totalPayable)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
    ),
    document.body,
  );
}
