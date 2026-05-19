export default function PaymentButton({
  children,
  disabled = false,
  loading = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
        disabled || loading
          ? "cursor-not-allowed bg-slate-300 text-slate-600"
          : "bg-indigo-600 text-white hover:bg-indigo-500",
      ].join(" ")}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
