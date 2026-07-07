import { useState } from "react";

export default function EditProfileModal({ open, profile, onClose, onSave }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={isSaving ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >

      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-slate-900">Edit Profile</div>
            <div className="text-sm text-slate-500 mt-1">Update your contact details.</div>
          </div>
            <button
              type="button"
              onClick={isSaving ? undefined : onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Close
            </button>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">User Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Phone number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="+91 98765 43210"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await onSave?.({
                    ...(profile ?? {}),
                    name: name.trim() || (profile?.name ?? ""),
                    phone: phone.trim() || (profile?.phone ?? ""),
                    email: email.trim() || (profile?.email ?? ""),
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
              className="rounded-xl bg-gradient-to-r from-primary via-secondary to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

