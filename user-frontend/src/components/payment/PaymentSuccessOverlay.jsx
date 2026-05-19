export default function PaymentSuccessOverlay({
  open,
  title,
  description,
  redirectLabel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          {redirectLabel}
        </p>
      </div>
    </div>
  );
}
