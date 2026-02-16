import { Position } from '@/types';

/**
 * Ray-casting algorithm for point-in-polygon detection
 */
export function isPointInPolygon(point: Position, polygon: Position[]): boolean {
  const { lat: y, lng: x } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i].lat, xi = polygon[i].lng;
    const yj = polygon[j].lat, xj = polygon[j].lng;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'critical': return 'hsl(0, 75%, 55%)';
    case 'high': return 'hsl(20, 85%, 55%)';
    case 'medium': return 'hsl(45, 90%, 55%)';
    case 'low': return 'hsl(200, 80%, 55%)';
    default: return 'hsl(142, 70%, 45%)';
  }
}

export function getRiskBadgeClass(risk: string): string {
  switch (risk) {
    case 'critical': return 'bg-destructive text-destructive-foreground';
    case 'high': return 'bg-destructive/80 text-destructive-foreground';
    case 'medium': return 'bg-accent text-accent-foreground';
    case 'low': return 'bg-status-info/20 text-status-info';
    default: return 'bg-primary/20 text-primary';
  }
}
