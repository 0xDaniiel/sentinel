import { useState, useCallback } from 'react';
import { RestrictedZone, IntrusionLog } from '@/types';
import { useAssetSimulation } from '@/hooks/useAssetSimulation';
import { useIntrusionDetection } from '@/hooks/useIntrusionDetection';
import MapView from '@/components/MapView';
import AlertPanel from '@/components/AlertPanel';
import StatusBar from '@/components/StatusBar';

const Index = () => {
  const { assets, updateAssetStatus } = useAssetSimulation();
  const [zones, setZones] = useState<RestrictedZone[]>([]);
  const [logs, setLogs] = useState<IntrusionLog[]>([]);

  const handleZoneCreated = useCallback((zone: RestrictedZone) => {
    setZones(prev => [...prev, zone]);
  }, []);

  const handleIntrusion = useCallback((log: IntrusionLog) => {
    setLogs(prev => [...prev, log]);
  }, []);

  useIntrusionDetection({
    assets,
    zones,
    onIntrusion: handleIntrusion,
    updateAssetStatus,
  });

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden scanline-overlay">
      <StatusBar
        assets={assets}
        totalAlerts={logs.length}
        zoneCount={zones.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            assets={assets}
            zones={zones}
            onZoneCreated={handleZoneCreated}
          />

          {/* Map overlay info */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 font-mono text-[10px] text-muted-foreground space-y-0.5">
            <p>▶ Use the draw tools (top-right) to create restricted zones</p>
            <p>▶ Assets moving in real-time — intrusions detected automatically</p>
          </div>
        </div>

        {/* Alert Panel */}
        <div className="w-80 border-l border-border bg-card flex-shrink-0 overflow-hidden">
          <AlertPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Index;
