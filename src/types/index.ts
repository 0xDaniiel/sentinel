export interface Position {
  lat: number;
  lng: number;
}

export interface Asset {
  id: string;
  label: string;
  type: 'vehicle' | 'drone';
  position: Position;
  heading: number; // degrees
  speed: number; // km/h
  status: 'safe' | 'warning' | 'intruding';
}

export interface RestrictedZone {
  id: string;
  name: string;
  points: Position[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  color: string;
}

export interface IntrusionLog {
  id: string;
  assetId: string;
  assetLabel: string;
  zoneId: string;
  zoneName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  position: Position;
  resolved: boolean;
}
