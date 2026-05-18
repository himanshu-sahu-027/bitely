import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import LocationPicker from "../../../../components/location/LocationPicker";
import forwardGeocode from "../../../../utils/ForwardGeocode";

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
  const [city, setCity] = useState(initialValues?.city ?? "");
  const [state, setState] = useState(initialValues?.state ?? "");
  const [pincode, setPincode] = useState(initialValues?.pincode ?? "");
  const [submitError, setSubmitError] = useState("");
  const [manualLookupError, setManualLookupError] = useState("");
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialValues?.latitude ?? null,
    longitude: initialValues?.longitude ?? null,
    displayAddress: initialValues?.displayAddress ?? initialValues?.fullAddress ?? "",
    addressLine: initialValues?.addressLine ?? "",
    city: initialValues?.city ?? "",
    state: initialValues?.state ?? "",
    pincode: initialValues?.pincode ?? "",
  });

  const title = mode === "edit" ? "Edit Address" : "Add New Address";

  const resolvedLabel = useMemo(() => {
    if (labelChoice === "new") {
      return customLabel.trim() || "Custom";
    }

    return labelChoice;
  }, [labelChoice, customLabel]);

  const handleLocateFromEnteredAddress = async () => {
    const manualAddressQuery = [doorFlat, area, landmark, city, state, pincode]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(", ");

    if (!manualAddressQuery) {
      setManualLookupError("Enter area, city, state, or pincode to find the address on the map.");
      return;
    }

    setIsFindingLocation(true);
    setManualLookupError("");
    setSubmitError("");

    try {
      const [bestMatch] = await forwardGeocode(manualAddressQuery);

      setSelectedLocation({
        latitude: bestMatch.latitude,
        longitude: bestMatch.longitude,
        displayAddress: bestMatch.label,
        addressLine: bestMatch.addressLine,
        city: bestMatch.city || city.trim(),
        state: bestMatch.state || state.trim(),
        pincode: bestMatch.pincode || pincode.trim(),
      });

      setCity(bestMatch.city || city.trim());
      setState(bestMatch.state || state.trim());
      setPincode(bestMatch.pincode || pincode.trim());
    } catch (error) {
      setManualLookupError(error.message || "Unable to find that typed address on the map.");
    } finally {
      setIsFindingLocation(false);
    }
  };

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute left-0 top-0 flex h-screen w-full max-w-[66rem] flex-col overflow-hidden border-r border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,255,1)_0%,rgba(241,245,255,0.96)_100%)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-sky-100 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
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

        <div className="space-y-5 overflow-y-auto px-5 py-5 md:px-8 md:py-6">
          <LocationPicker
            initialValue={selectedLocation}
            onLocationChange={(nextLocation) => {
              setSelectedLocation(nextLocation);
              setCity(nextLocation.city ?? "");
              setState(nextLocation.state ?? "");
              setPincode(nextLocation.pincode ?? "");
              setManualLookupError("");
              setSubmitError("");
            }}
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-slate-800">Door / Flat</label>
                  <input
                    value={doorFlat}
                    onChange={(event) => setDoorFlat(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., B-1203"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-slate-800">Area</label>
                  <input
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Apartment name or local delivery note"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-800">Landmark</label>
                  <input
                    value={landmark}
                    onChange={(event) => setLandmark(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Near Metro Station"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-slate-800">City</label>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Bengaluru"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-slate-800">State</label>
                  <input
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Karnataka"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-slate-800">Pincode</label>
                  <input
                    value={pincode}
                    onChange={(event) => setPincode(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., 560038"
                  />
                </div>

                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleLocateFromEnteredAddress}
                    disabled={isFindingLocation}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isFindingLocation ? "Finding Address..." : "Use Entered Address On Map"}
                  </button>
                </div>
              </div>

              {manualLookupError ? (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {manualLookupError}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
                  Type the address fields and use the button to move the map marker to the best matching location.
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-[0_20px_45px_rgba(79,70,229,0.08)]">
              <div className="text-xs font-semibold text-slate-800">Label</div>
              <div className="mt-1 text-[11px] text-slate-500">Choose a tag to identify this address quickly.</div>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-800">Select label</label>
                  <select
                    value={labelChoice}
                    onChange={(event) => setLabelChoice(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Home">Home</option>
                    <option value="College">College</option>
                    <option value="Work">Work</option>
                    <option value="new">Add new label option</option>
                  </select>
                </div>

                {labelChoice === "new" ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-800">New label</label>
                    <input
                      value={customLabel}
                      onChange={(event) => setCustomLabel(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-tight outline-none transition focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g., Hostel, Parent's place"
                    />
                  </div>
                ) : null}

                <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-xs leading-6 text-slate-600">
                  Selected city: <span className="font-semibold text-slate-800">{selectedLocation.city || "--"}</span>
                  <br />
                  State: <span className="font-semibold text-slate-800">{selectedLocation.state || "--"}</span>
                  <br />
                  Pincode: <span className="font-semibold text-slate-800">{selectedLocation.pincode || "--"}</span>
                </div>
              </div>
            </div>
          </div>

          {submitError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const hasCoordinates =
                  Number.isFinite(selectedLocation.latitude) &&
                  Number.isFinite(selectedLocation.longitude);

                if (!hasCoordinates) {
                  setSubmitError("Choose a map location before saving the address.");
                  return;
                }

                if (!selectedLocation.displayAddress) {
                  setSubmitError("Wait for the readable address to load, then try again.");
                  return;
                }

                const deliveryNotes = [doorFlat.trim(), area.trim(), landmark.trim()]
                  .filter(Boolean)
                  .join(", ");

                const next = {
                  id: initialValues?.id ?? `addr-${Date.now()}`,
                  label: resolvedLabel,
                  doorFlat: doorFlat.trim(),
                  area: area.trim(),
                  landmark: landmark.trim(),
                  fullAddress: [deliveryNotes, selectedLocation.displayAddress].filter(Boolean).join(", "),
                  displayAddress: selectedLocation.displayAddress,
                  addressLine: selectedLocation.addressLine,
                  city: city.trim() || selectedLocation.city,
                  state: state.trim() || selectedLocation.state,
                  pincode: pincode.trim() || selectedLocation.pincode,
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
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
    </div>,
    document.body,
  );
}
