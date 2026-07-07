import { useState } from "react"


export default function CartCouponBox({
  coupon,
  disabled,
  onApply,
  onRemove,
  formatINR,
}) {
  const applied = Boolean(coupon?.applied)
  const [code, setCode] = useState(coupon?.code || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const discount = Math.max(0, Number(coupon?.discount || 0))
  const error = String(coupon?.error || "")

  // Remount input when coupon application state changes so local state
  // stays consistent without synchronizing via useEffect.
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:p-5"
      key={applied ? "applied" : "idle"}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Coupons</h3>
        {applied && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Applied
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={disabled || applied}
          placeholder="Enter coupon code"
          className={[
            "h-11 w-full rounded-2xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition",
            "focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100",
            disabled || applied
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
              : "border-slate-200",
          ].join(" ")}
        />

        {!applied ? (
          <button
            type="button"
            disabled={disabled || isUpdating}
            onClick={disabled || isUpdating ? undefined : () => {
              setIsUpdating(true)
              Promise.resolve(onApply?.(code)).finally(() => setIsUpdating(false))
            }}
            className={[
              "h-11 shrink-0 rounded-2xl px-4 text-sm font-semibold shadow-sm transition active:scale-[0.99]",
              disabled || isUpdating
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-indigo-600 text-white hover:bg-indigo-500",
            ].join(" ")}
          >
            {isUpdating ? "Applying..." : "Apply"}
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled || isUpdating}
            onClick={disabled || isUpdating ? undefined : () => {
              setIsUpdating(true)
              Promise.resolve(onRemove?.()).finally(() => setIsUpdating(false))
            }}
            className="h-11 shrink-0 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? "Removing..." : "Remove"}
          </button>
        )}

      </div>

      {error ? (
        <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>
      ) : applied ? (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-semibold text-emerald-900">
            {coupon.code} applied
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            You saved {formatINR(discount)} on this order.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Try: <span className="font-semibold">BITELY50</span> (₹50 off) or{" "}
          <span className="font-semibold">SAVE100</span> (₹100 off)
        </p>
      )}
    </div>
  )
}

