import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

export default function MapEvents({ selectedPosition, onMapClick }) {
  const map = useMapEvents({
    click(event) {
      onMapClick?.(event.latlng);
    },
  });

  useEffect(() => {
    if (!selectedPosition) {
      return;
    }

    map.flyTo([selectedPosition.lat, selectedPosition.lng], 16, {
      duration: 0.8,
    });
  }, [map, selectedPosition]);

  return null;
}
