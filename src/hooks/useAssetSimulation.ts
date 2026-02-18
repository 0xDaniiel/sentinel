import { useState, useEffect, useRef, useCallback } from "react";
import { Asset, Position } from "@/types";
import { generateId } from "@/lib/geo";

// Center around a generic area (Washington DC area for demo)
const MAP_CENTER: Position = { lat: 38.9072, lng: -77.0369 };
const SPAWN_RADIUS = 0.04;

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createAsset(index: number): Asset {
  const types: ("vehicle" | "drone")[] = ["vehicle", "drone"];
  const type = types[index % 2];
  const prefix = type === "vehicle" ? "VH" : "DR";

  return {
    id: generateId(),
    label: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    type,
    position: {
      lat: MAP_CENTER.lat + randomInRange(-SPAWN_RADIUS, SPAWN_RADIUS),
      lng: MAP_CENTER.lng + randomInRange(-SPAWN_RADIUS, SPAWN_RADIUS),
    },
    heading: randomInRange(0, 360),
    speed: type === "drone" ? randomInRange(30, 80) : randomInRange(15, 50),
    status: "safe",
  };
}

const ASSET_COUNT = 8;
const TICK_INTERVAL = 100; // ms
const HEADING_CHANGE_CHANCE = 0.03;

export function useAssetSimulation() {
  const [assets, setAssets] = useState<Asset[]>(() =>
    Array.from({ length: ASSET_COUNT }, (_, i) => createAsset(i)),
  );

  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  const updateAssetStatus = useCallback(
    (assetId: string, status: Asset["status"]) => {
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, status } : a)),
      );
    },
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          let heading = asset.heading;
          if (Math.random() < HEADING_CHANGE_CHANCE) {
            heading += randomInRange(-45, 45);
          }

          // Convert speed from km/h to degrees per tick (rough approximation)
          const speedDeg =
            (asset.speed / 111000) * (TICK_INTERVAL / 1000) * 100;
          const rad = (heading * Math.PI) / 180;

          let lat = asset.position.lat + Math.cos(rad) * speedDeg;
          let lng = asset.position.lng + Math.sin(rad) * speedDeg;

          // Bounce back if too far from center
          const distLat = lat - MAP_CENTER.lat;
          const distLng = lng - MAP_CENTER.lng;
          if (
            Math.abs(distLat) > SPAWN_RADIUS * 1.5 ||
            Math.abs(distLng) > SPAWN_RADIUS * 1.5
          ) {
            heading = (heading + 180) % 360;
            lat =
              asset.position.lat +
              Math.cos((heading * Math.PI) / 180) * speedDeg;
            lng =
              asset.position.lng +
              Math.sin((heading * Math.PI) / 180) * speedDeg;
          }

          return {
            ...asset,
            position: { lat, lng },
            heading,
          };
        }),
      );
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { assets, updateAssetStatus };
}
