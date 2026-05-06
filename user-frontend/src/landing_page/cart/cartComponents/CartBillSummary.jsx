import { useState } from "react"

export default function CartBillSummary({
  itemTotal,
  deliveryFee,
  platformFee,
  gst,
  discount,
  toPay,
  savings,
  formatINR,
}) {
  const [showAllFees, setShowAllFees] = useState(true)
  const hasDiscount = discount > 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Bill details</h3>

        <button
          type="button"
          onClick={() => setShowAllFees((current) => !current)}
          className="rounded-xl px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          {showAllFees ? "Hide" : "Show"} breakup
        </button>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row label="Item total" value={formatINR(itemTotal)} />

        {showAllFees && (
          <>
            <Row label="Delivery fee" value={formatINR(deliveryFee)} subtle />
            <Row label="Platform fee" value={formatINR(platformFee)} subtle />
            <Row label="GST (5%)" value={formatINR(gst)} subtle />
          </>
        )}

        {hasDiscount && (
          <Row
            label={`Discount${savings ? "" : ""}`}
            value={`- ${formatINR(discount)}`}
            valueClassName="text-emerald-700"
          />
        )}

        <div className="my-3 h-px w-full bg-slate-100" />

        <Row
          label="To Pay"
          value={formatINR(toPay)}
          labelClassName="text-slate-900 font-semibold"
          valueClassName="text-slate-900 font-semibold"
        />

        {savings > 0 && (
          <div className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2">
            <p className="text-sm font-semibold text-emerald-900">
              You saved {formatINR(savings)}
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Taxes and fees are indicative and may change at checkout.
      </p>
    </div>
  )
}

function Row({
  label,
  value,
  subtle,
  labelClassName = "",
  valueClassName = "",
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={[
          "text-slate-700",
          subtle ? "text-slate-600" : "",
          labelClassName,
        ].join(" ")}
      >
        {label}
      </span>
      <span className={["text-slate-900 tabular-nums", valueClassName].join(" ")}>
        {value}
      </span>
    </div>
  )
}

