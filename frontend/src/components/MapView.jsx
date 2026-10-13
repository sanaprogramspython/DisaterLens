import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

const DEMO_CENTER = [17.3363, 78.3979];

function MapViewport({ center, refreshKey }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timer);
  }, [map, center[0], center[1], refreshKey]);
  return null;
}

export default function MapView({ routeData, showRoute = false, dimmed = false }) {
  const start = routeData?.demo_user_start?.coordinates ?? DEMO_CENTER;
  const safe = routeData?.safe_zone?.coordinates;
  const routeCoordinates = routeData?.route?.coordinates ?? [];
  const floodCoordinates = routeData?.flood_zone?.coordinates ?? [];

  return (
    <div
      className={`map-wrap${dimmed ? " map-dimmed" : ""}`}
      aria-label={showRoute ? "Evacuation route map" : "Area safety map"}
    >
      <MapContainer
        center={start}
        zoom={16}
        scrollWheelZoom={false}
        className="leaflet-map"
      >
        <MapViewport center={start} refreshKey={`${showRoute}-${dimmed}`} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={start}
          radius={9}
          pathOptions={{ color: "#fff", weight: 3, fillColor: "#1677e8", fillOpacity: 1 }}
        >
          <Tooltip>YOU ARE HERE</Tooltip>
        </CircleMarker>
        {safe && (
          <CircleMarker
            center={safe}
            radius={8}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#18863b", fillOpacity: 1 }}
          >
            <Tooltip>{routeData.safe_zone.name}</Tooltip>
          </CircleMarker>
        )}
        {showRoute && floodCoordinates.length > 0 && (
          <Polygon
            positions={floodCoordinates}
            pathOptions={{ color: "#c00000", fillColor: "#e53935", fillOpacity: 0.3 }}
          />
        )}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: "#1268db", weight: 5 }}
          />
        )}
      </MapContainer>
      {showRoute && (
        <span className="map-label safe-zone-label" aria-hidden="true">
          SAFE ZONE
        </span>
      )}
    </div>
  );
}
