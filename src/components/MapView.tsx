import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { Asset, RestrictedZone, Position } from "@/types";
import { generateId, getRiskColor } from "@/lib/geo";

interface MapViewProps {
  assets: Asset[];
  zones: RestrictedZone[];
  onZoneCreated: (zone: RestrictedZone) => void;
}

const RISK_LEVELS: RestrictedZone["riskLevel"][] = [
  "low",
  "medium",
  "high",
  "critical",
];
let zoneCounter = 0;

function getAssetIcon(asset: Asset): L.DivIcon {
  const isIntruding = asset.status === "intruding";
  const color = isIntruding ? "#e04444" : "#2dd284";
  const pulseClass = isIntruding ? "alert-pulse" : "";
  const icon = asset.type === "drone" ? "◆" : "▲";
  const rotation = asset.heading;

  return L.divIcon({
    className: "custom-asset-icon",
    html: `
      <div class="${pulseClass}" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -50%);
      ">
        <div style="
          width: 28px;
          height: 28px;
          background: ${color}22;
          border: 2px solid ${color};
          border-radius: ${asset.type === "drone" ? "4px" : "50%"};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: ${color};
          transform: rotate(${rotation}deg);
          box-shadow: 0 0 12px ${color}44;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        ">${icon}</div>
        <div style="
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: ${color};
          margin-top: 2px;
          background: hsl(220, 20%, 7%);
          padding: 1px 4px;
          border-radius: 2px;
          border: 1px solid ${color}44;
          white-space: nowrap;
        ">${asset.label}</div>
      </div>
    `,
    iconSize: [40, 44],
    iconAnchor: [20, 22],
  });
}

export default function MapView({
  assets,
  zones,
  onZoneCreated,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const assetMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const zoneLayersRef = useRef<Map<string, L.Polygon>>(new Map());
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [38.9072, -77.0369],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
      },
    ).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          shapeOptions: {
            color: "#e8c840",
            fillColor: "#e8c840",
            fillOpacity: 0.15,
            weight: 2,
          },
          allowIntersection: false,
        },
        polyline: false,
        circle: false,
        rectangle: {
          shapeOptions: {
            color: "#e8c840",
            fillColor: "#e8c840",
            fillOpacity: 0.15,
            weight: 2,
          },
        },
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer as L.Polygon;
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      const points: Position[] = latlngs.map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));

      zoneCounter++;
      const riskLevel = RISK_LEVELS[Math.min(zoneCounter - 1, 3) % 4];
      const color = getRiskColor(riskLevel);

      const zone: RestrictedZone = {
        id: generateId(),
        name: `Zone ${String(zoneCounter).padStart(2, "0")}`,
        points,
        riskLevel,
        color,
      };

      onZoneCreated(zone);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const existingMarkers = assetMarkersRef.current;
    const currentIds = new Set(assets.map((a) => a.id));

    existingMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(marker);
        existingMarkers.delete(id);
      }
    });

    for (const asset of assets) {
      const existing = existingMarkers.get(asset.id);
      if (existing) {
        existing.setLatLng([asset.position.lat, asset.position.lng]);
        existing.setIcon(getAssetIcon(asset));
      } else {
        const marker = L.marker([asset.position.lat, asset.position.lng], {
          icon: getAssetIcon(asset),
        }).addTo(map);
        existingMarkers.set(asset.id, marker);
      }
    }
  }, [assets]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const existingLayers = zoneLayersRef.current;
    const currentIds = new Set(zones.map((z) => z.id));

    existingLayers.forEach((layer, id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(layer);
        existingLayers.delete(id);
      }
    });

    for (const zone of zones) {
      if (existingLayers.has(zone.id)) continue;

      const polygon = L.polygon(
        zone.points.map((p) => [p.lat, p.lng] as [number, number]),
        {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "8 4",
        },
      ).addTo(map);

      polygon.bindTooltip(
        `<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
          <strong>${zone.name}</strong><br/>
          Risk: ${zone.riskLevel.toUpperCase()}
        </div>`,
        { className: "zone-tooltip", sticky: true },
      );

      existingLayers.set(zone.id, polygon);
    }
  }, [zones]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-border"
    />
  );
}
