import { useState, useEffect } from 'react';
import { Asset } from '@/types';
import { Truck } from 'lucide-react';

interface StatusBarProps {
  assets: Asset[];
  totalAlerts: number;
  zoneCount: number;
}

export default function StatusBar({ assets, totalAlerts, zoneCount }: StatusBarProps) {
  const intruding = assets.filter(a => a.status === 'intruding').length;
  const safe = assets.filter(a => a.status === 'safe').length;

  return (
    <div className="flex items-center gap-6 px-5 py-2.5 bg-card border-b border-border font-mono text-xs">
      <div className="flex items-center gap-2 mr-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-bold tracking-widest uppercase text-primary">
          SENTINEL
        </span>
        <span className="text-muted-foreground">v1.0</span>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Assets:</span>
        <span className="text-foreground font-semibold">{assets.length}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-status-safe" />
        <span className="text-status-safe">{safe}</span>
      </div>

      {intruding > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
          <span className="text-status-danger font-bold">{intruding} INTRUDING</span>
        </div>
      )}

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Zones:</span>
        <span className="text-accent font-semibold">{zoneCount}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Alerts:</span>
        <span className={`font-semibold ${totalAlerts > 0 ? 'text-status-danger' : 'text-foreground'}`}>
          {totalAlerts}
        </span>
      </div>

      <div className="ml-auto text-muted-foreground">
        <LiveClock />
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{time} UTC</span>;
}
