export default function AddressCard({ address, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
              {address.label}
            </span>
          </div>
          <div className="mt-3 text-sm text-slate-700">
            <p className="text-slate-800 font-semibold">Address</p>
            <p className="mt-1">{address.fullAddress}</p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(address)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              const ok = window.confirm("Delete this address?");
              if (ok) onDelete?.(address.id);
            }}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

