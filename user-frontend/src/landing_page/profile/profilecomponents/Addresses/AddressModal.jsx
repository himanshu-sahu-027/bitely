import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function AddressModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
}) {
  const presetLabels = useMemo(() => ["Home", "College", "Work"], []);
  const initialLabel = initialValues?.label;
  const isPresetLabel = presetLabels.includes(initialLabel);

  const [labelChoice, setLabelChoice] = useState(
    isPresetLabel ? initialLabel : initialLabel ? "new" : "Home",
  );
  const [customLabel, setCustomLabel] = useState(
    isPresetLabel ? "" : initialLabel ?? "",
  );

  const [doorFlat, setDoorFlat] = useState(initialValues?.doorFlat ?? "");
  const [area, setArea] = useState(initialValues?.area ?? "");
  const [landmark, setLandmark] = useState(initialValues?.landmark ?? "");

  const title = mode === "edit" ? "Edit Address" : "Add New Address";

  const resolvedLabel = useMemo(() => {
    if (labelChoice === "new") return customLabel.trim() || "Custom";
    return labelChoice;
  }, [labelChoice, customLabel]);

  if (!open) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    (
    <div
      className="fixed inset-0 z-[9999] bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute left-0 top-0 flex h-screen w-full max-w-3xl flex-col overflow-hidden border-r border-slate-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-bold text-slate-900">{title}</div>
            <div className="mt-1 text-xs text-slate-500">Keep your delivery details up to date.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-auto"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-7 py-5 md:px-9 md:py-6">
          {/* Map placeholder */}
          <div className="flex h-28 items-center justify-center rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-800">Map Placeholder</div>
              <div className="mt-1 text-[11px] text-slate-500">Selected location will appear here.</div>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-800">Door / Flat</label>
              <input
                value={doorFlat}
                onChange={(e) => setDoorFlat(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., B-1203"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-800">Area</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Indiranagar 100 Feet Road"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-800">Landmark</label>
              <input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Near Metro Station"
              />
            </div>
          </div>

          {/* Label selection */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-800">Label</div>
            <div className="mt-1 text-[11px] text-slate-500">Choose a tag to identify this address quickly.</div>

            <div className="mt-3 grid items-start gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-800">Select label</label>
                <select
                  value={labelChoice}
                  onChange={(e) => setLabelChoice(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Home">Home</option>
                  <option value="College">College</option>
                  <option value="Work">Work</option>
                  <option value="new">Add new label option</option>
                </select>
              </div>

              {labelChoice === "new" && (
                <div>
                  <label className="text-xs font-semibold text-slate-800">New label</label>
                  <input
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Hostel, Parent's place"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
            Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const next = {
                  id: initialValues?.id ?? `addr-${Date.now()}`,
                  label: resolvedLabel,
                  doorFlat: doorFlat.trim(),
                  area: area.trim(),
                  landmark: landmark.trim(),
                  fullAddress: `${doorFlat.trim()}, ${area.trim()}, ${landmark.trim()}`.replace(/^,\s*|,\s*$/g, ""),
                };
                onSubmit(next);
              }}
              className="rounded-xl bg-gradient-to-r from-primary via-secondary to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              {mode === "edit" ? "Save Address" : "Add Address"}
            </button>
          </div>
        </div>
      </div>
    </div>
    ),
    document.body,
  );
}
