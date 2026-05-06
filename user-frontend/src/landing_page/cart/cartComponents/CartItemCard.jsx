export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  formatINR,
}) {
  const disableDecrease = item.quantity <= 1

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            {formatINR(item.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl px-2 py-1 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 active:scale-[0.99]"
          aria-label={`Remove ${item.name}`}
        >
          Remove
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={onDecrease}
            disabled={disableDecrease}
            className={[
              "h-9 w-9 rounded-xl text-base font-bold transition",
              disableDecrease
                ? "cursor-not-allowed text-slate-300"
                : "text-slate-800 hover:bg-white active:scale-[0.98]",
            ].join(" ")}
            aria-label={`Decrease ${item.name} quantity`}
          >
            −
          </button>

          <span className="w-10 select-none text-center text-sm font-semibold text-slate-900 tabular-nums">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={onIncrease}
            className="h-9 w-9 rounded-xl text-base font-bold text-slate-800 transition hover:bg-white active:scale-[0.98]"
            aria-label={`Increase ${item.name} quantity`}
          >
            +
          </button>
        </div>

        <p className="text-sm font-semibold text-slate-900 tabular-nums">
          {formatINR(item.price * item.quantity)}
        </p>
      </div>
    </div>
  )
}

