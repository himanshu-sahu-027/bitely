export default function CartCheckoutBar({
  totalLabel,
  disabled,
  isEmpty,
  restaurantClosed,
  pricePulse,
  savingsLabel,
  onOrderNow,
}) {
  let reason = "";

  if (disabled) {
    if (isEmpty) reason = "Add items to proceed";
    else if (restaurantClosed) reason = "Kitchen is closed";
    else reason = "Cannot checkout right now";
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-300 bg-slate-200/95 backdrop-blur">
      <div className="mx-auto w-full max-w-5xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* LEFT SIDE */}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total
            </p>

            <div className="flex items-baseline gap-2">
              <p
                className={[
                  "text-lg font-semibold text-slate-900 tabular-nums transition-transform duration-200",
                  pricePulse ? "scale-[1.02]" : "scale-100",
                ].join(" ")}
              >
                {totalLabel}
              </p>

              {savingsLabel ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Saved {savingsLabel}
                </span>
              ) : null}
            </div>

            {/* MESSAGE AREA */}
            {reason ? (
              <p className="mt-1 truncate text-xs font-medium text-rose-600">
                {reason}
              </p>
            ) : (
              <p className="mt-1 text-xs font-medium text-blue-600">
                🚚 Batch delivery • Lower delivery cost
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="button"
            disabled={disabled}
            onClick={onOrderNow}
            aria-disabled={disabled}
            className={[
              "h-12 shrink-0 rounded-2xl px-5 text-sm font-semibold shadow-sm transition active:scale-[0.99]",
              disabled
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-indigo-600 text-white hover:bg-indigo-500",
            ].join(" ")}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}


