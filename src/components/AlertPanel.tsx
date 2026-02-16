import { IntrusionLog } from '@/types';
import { getRiskBadgeClass } from '@/lib/geo';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

interface AlertPanelProps {
  logs: IntrusionLog[];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AlertPanel({ logs }: AlertPanelProps) {
  const recentLogs = logs.slice(-50).reverse();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <AlertTriangle className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold font-mono uppercase tracking-wider text-foreground">
          Intrusion Alerts
        </h2>
        <span className="ml-auto text-xs font-mono bg-destructive/20 text-destructive px-2 py-0.5 rounded">
          {logs.length}
        </span>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto">
        {recentLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Shield className="w-8 h-8 opacity-40" />
            <p className="text-xs font-mono">NO INTRUSIONS DETECTED</p>
            <p className="text-xs opacity-60">Draw zones on the map to start monitoring</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {recentLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="border-b border-border/50 px-4 py-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {log.assetLabel}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${getRiskBadgeClass(log.riskLevel)}`}
                  >
                    {log.riskLevel}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 flex-shrink-0" />
                    <span>{log.zoneName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                  <div className="text-[10px] opacity-60">
                    {log.position.lat.toFixed(5)}, {log.position.lng.toFixed(5)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
