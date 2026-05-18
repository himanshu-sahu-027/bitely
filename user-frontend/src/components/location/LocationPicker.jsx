import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { LocateFixed } from "lucide-react";

import reverseGeocode from "../../utils/ReverseGeocode";
import fixLeafletIcons from "../../utils/leafletIconFix";
import MapEvents from "./MapEvents";
import LocationInfo from "./LocationInfo";

const DEFAULT_POSITION = {
  lat: 22.5726,
  lng: 88.3639,
};

export default function LocationPicker({ initialValue, onLocationChange }) {
  const hasInitialCoordinates =
    Number.isFinite(initialValue?.latitude) && Number.isFinite(initialValue?.longitude);

  const [selectedPosition, setSelectedPosition] = useState(() => {
    if (hasInitialCoordinates) {
      return {
        lat: initialValue.latitude,
        lng: initialValue.longitude,
      };
    }

    return DEFAULT_POSITION;
  });
  const [locationDetails, setLocationDetails] = useState(() => ({
    latitude: initialValue?.latitude ?? null,
    longitude: initialValue?.longitude ?? null,
    displayAddress: initialValue?.displayAddress ?? initialValue?.fullAddress ?? "",
    addressLine: initialValue?.addressLine ?? "",
    city: initialValue?.city ?? "",
    state: initialValue?.state ?? "",
    pincode: initialValue?.pincode ?? "",
  }));
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const hasLoadedInitialLocationRef = useRef(false);
  const lastResolvedCoordinatesRef = useRef("");
  const lastAppliedExternalCoordinatesRef = useRef("");

  fixLeafletIcons();

  const syncLocationDetails = useCallback((nextDetails) => {
    setLocationDetails(nextDetails);
    onLocationChange?.(nextDetails);
  }, [onLocationChange]);

  const resolveAddressFromCoordinates = useCallback(async (latitude, longitude) => {
    const roundedKey = `${latitude.toFixed(5)}:${longitude.toFixed(5)}`;

    if (lastResolvedCoordinatesRef.current === roundedKey) {
      return;
    }

    setIsResolvingAddress(true);
    setLocationError("");

    try {
      const nextDetails = await reverseGeocode(latitude, longitude);
      lastResolvedCoordinatesRef.current = roundedKey;
      syncLocationDetails(nextDetails);
    } catch (error) {
      setLocationError(error.message || "Unable to read the address for this location.");
    } finally {
      setIsResolvingAddress(false);
    }
  }, [syncLocationDetails]);

  const updatePosition = useCallback(async (latitude, longitude) => {
    lastAppliedExternalCoordinatesRef.current = `${latitude.toFixed(5)}:${longitude.toFixed(5)}`;
    setSelectedPosition({
      lat: latitude,
      lng: longitude,
    });

    await resolveAddressFromCoordinates(latitude, longitude);
  }, [resolveAddressFromCoordinates]);

  const detectCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setIsLocating(false);
        await updatePosition(latitude, longitude);
      },
      (error) => {
        setIsLocating(false);

        if (error.code === 1) {
          setLocationError("Location permission was denied. You can still search or tap on the map.");
          return;
        }

        if (error.code === 2) {
          setLocationError("Your location could not be detected. Try again in a few seconds.");
          return;
        }

        setLocationError("We could not access your current location right now.");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  }, [updatePosition]);

  useEffect(() => {
    if (hasLoadedInitialLocationRef.current) {
      return;
    }

    hasLoadedInitialLocationRef.current = true;

    if (hasInitialCoordinates) {
      resolveAddressFromCoordinates(initialValue.latitude, initialValue.longitude);
      return;
    }

    detectCurrentLocation();
  }, [detectCurrentLocation, hasInitialCoordinates, initialValue, resolveAddressFromCoordinates]);

  useEffect(() => {
    if (!hasInitialCoordinates) {
      return;
    }

    const nextCoordinatesKey = `${initialValue.latitude.toFixed(5)}:${initialValue.longitude.toFixed(5)}`;

    if (lastAppliedExternalCoordinatesRef.current === nextCoordinatesKey) {
      return;
    }

    lastAppliedExternalCoordinatesRef.current = nextCoordinatesKey;
    setSelectedPosition({
      lat: initialValue.latitude,
      lng: initialValue.longitude,
    });

    setLocationDetails((previousValue) => ({
      ...previousValue,
      latitude: initialValue.latitude,
      longitude: initialValue.longitude,
      displayAddress: initialValue.displayAddress ?? previousValue.displayAddress,
      addressLine: initialValue.addressLine ?? previousValue.addressLine,
      city: initialValue.city ?? previousValue.city,
      state: initialValue.state ?? previousValue.state,
      pincode: initialValue.pincode ?? previousValue.pincode,
    }));
  }, [hasInitialCoordinates, initialValue]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="overflow-hidden rounded-[30px] border border-sky-100 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Pinpoint your delivery spot</h3>
              <p className="mt-1 text-sm text-slate-500">
                Drag the marker or tap anywhere on the map to update the address.
              </p>
            </div>

            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LocateFixed className="h-4 w-4" />
              Use Current Location
            </button>
          </div>

          <div className="location-picker-map overflow-hidden rounded-[24px]">
            <MapContainer
              center={[selectedPosition.lat, selectedPosition.lng]}
              zoom={16}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[selectedPosition.lat, selectedPosition.lng]}
                draggable
                eventHandlers={{
                  dragend: async (event) => {
                    const marker = event.target;
                    const position = marker.getLatLng();
                    await updatePosition(position.lat, position.lng);
                  },
                }}
              />

              <MapEvents
                selectedPosition={selectedPosition}
                onMapClick={async (latlng) => {
                  await updatePosition(latlng.lat, latlng.lng);
                }}
              />
            </MapContainer>
          </div>
        </div>

        <LocationInfo
          locationDetails={locationDetails}
          isLocating={isLocating}
          isResolvingAddress={isResolvingAddress}
          locationError={locationError}
        />
      </div>
    </div>
  );
}
