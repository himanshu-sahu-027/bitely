import { AlertCircle, MapPin, LocateFixed, LoaderCircle } from "lucide-react";

export default function LocationInfo({
  locationDetails,
  isLocating,
  isResolvingAddress,
  locationError,
}) {
  return (
    <div className="rounded-[28px] bg-[linear-gradient(160deg,#0f172a_0%,#312e81_58%,#0f766e_100%)] p-5 text-white shadow-[0_24px_48px_rgba(15,23,42,0.22)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
        <MapPin className="h-4 w-4" />
        Delivery location details
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-300">Latitude</div>
          <div className="mt-2 text-sm font-semibold text-white">
            {Number.isFinite(locationDetails?.latitude) ? locationDetails.latitude.toFixed(6) : "--"}
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-300">Longitude</div>
          <div className="mt-2 text-sm font-semibold text-white">
            {Number.isFinite(locationDetails?.longitude) ? locationDetails.longitude.toFixed(6) : "--"}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/10 p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-300">Readable address</div>
        <p className="mt-2 text-sm leading-6 text-slate-100">
          {locationDetails?.displayAddress || "Pick a point on the map or search for a place to see the address."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-200">
        {isLocating ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            <LocateFixed className="h-3.5 w-3.5" />
            Detecting your location...
          </span>
        ) : null}

        {isResolvingAddress ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Fetching address from Nominatim...
          </span>
        ) : null}
      </div>

      {locationError ? (
        <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <span className="inline-flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            {locationError}
          </span>
        </div>
      ) : null}
    </div>
  );
}
