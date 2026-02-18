import { useEffect, useRef, useCallback } from "react";
import { Asset, RestrictedZone, IntrusionLog } from "@/types";
import { isPointInPolygon, generateId } from "@/lib/geo";

interface UseIntrusionDetectionProps {
  assets: Asset[];
  zones: RestrictedZone[];
  onIntrusion: (log: IntrusionLog) => void;
  updateAssetStatus: (assetId: string, status: Asset["status"]) => void;
}

export function useIntrusionDetection({
  assets,
  zones,
  onIntrusion,
  updateAssetStatus,
}: UseIntrusionDetectionProps) {
  // Track which assets are currently in which zones to avoid duplicate alerts
  const activeIntrusions = useRef<Set<string>>(new Set());

  const checkIntrusions = useCallback(() => {
    const currentIntrusions = new Set<string>();

    for (const asset of assets) {
      let isIntruding = false;

      for (const zone of zones) {
        const key = `${asset.id}:${zone.id}`;

        if (isPointInPolygon(asset.position, zone.points)) {
          isIntruding = true;
          currentIntrusions.add(key);

          // New intrusion - fire alert
          if (!activeIntrusions.current.has(key)) {
            const log: IntrusionLog = {
              id: generateId(),
              assetId: asset.id,
              assetLabel: asset.label,
              zoneId: zone.id,
              zoneName: zone.name,
              riskLevel: zone.riskLevel,
              timestamp: new Date(),
              position: { ...asset.position },
              resolved: false,
            };
            onIntrusion(log);
          }
        }
      }

      if (isIntruding && asset.status !== "intruding") {
        updateAssetStatus(asset.id, "intruding");
      } else if (!isIntruding && asset.status === "intruding") {
        updateAssetStatus(asset.id, "safe");
      }
    }

    // Mark resolved intrusions
    activeIntrusions.current = currentIntrusions;
  }, [assets, zones, onIntrusion, updateAssetStatus]);

  useEffect(() => {
    checkIntrusions();
  }, [checkIntrusions]);
}
