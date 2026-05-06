import { useState } from "react";

function Toggle({ checked, onChange, labelId }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange?.(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary/80" : "bg-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function DeleteConfirmModal({ open, onCancel, onConfirm }) {
  const [typed, setTyped] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-lg font-bold text-slate-900">Delete Account Permanently</div>
          <div className="text-sm text-slate-500 mt-1">
            This action cannot be undone.
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="text-sm font-semibold text-red-700">
              Warning
            </div>
            <div className="text-sm text-red-700 mt-1">
              Type <span className="font-bold">DELETE</span> to confirm.
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Confirmation</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-red-200"
              placeholder="DELETE"
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (typed.trim() === "DELETE") onConfirm?.();
              }}
              disabled={typed.trim() !== "DELETE"}
              className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60 disabled:hover:opacity-60"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage({ onLogout, onDeleteAccount }) {
  const [orderReminders, setOrderReminders] = useState(true);
  const [buzzNearLocation, setBuzzNearLocation] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <section>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Settings</h3>
            <p className="text-sm text-slate-500 mt-1">Manage notifications and your account.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 md:p-5">
            <div className="text-sm font-bold text-slate-900">Notifications</div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div id="order-reminders" className="text-sm font-semibold text-slate-800">
                    Order reminders
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Get notified before delivery.</div>
                </div>
                <Toggle checked={orderReminders} onChange={setOrderReminders} labelId="order-reminders" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div id="buzz-near" className="text-sm font-semibold text-slate-800">
                    Buzz near location
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Promotions near you.</div>
                </div>
                <Toggle checked={buzzNearLocation} onChange={setBuzzNearLocation} labelId="buzz-near" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div id="order-updates" className="text-sm font-semibold text-slate-800">
                    Order updates
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Status changes and ETA updates.</div>
                </div>
                <Toggle checked={orderUpdates} onChange={setOrderUpdates} labelId="order-updates" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 md:p-5">
            <div className="text-sm font-bold text-slate-900">Account</div>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => onLogout?.()}
                className="rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm font-bold border border-primary/20 shadow-sm transition hover:opacity-90"
              >
                Logout
              </button>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="text-sm font-bold text-red-700">Delete Account Permanently</div>
                <div className="text-sm text-red-700 mt-1">
                  This action cannot be undone. Your order history will be removed.
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                >
                  Delete Account Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DeleteConfirmModal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          onDeleteAccount?.();
        }}
      />
    </>
  );
}

