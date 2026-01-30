export type ContainerStatus = 'TRANSIT' | 'PORT' | 'CUSTOMS' | 'WAREHOUSE';
export type SencamerStatus = 'VALID' | 'WARNING' | 'EXPIRED' | 'PROCESSING';

export interface Container {
  id: string;
  containerNumber: string; // e.g., HLBU-1234567
  supplier: string;
  textileType: string; // e.g., 'Tela Algodón', 'Seda'
  containerSize?: '20GP' | '40HQ';
  weight?: string;
  departureDate?: string;
  status: ContainerStatus;
  sencamerStatus: SencamerStatus;
  sencamerExpirationDate?: string;
  eta?: string; // For Transit
  vessel?: string; // For Port
  arrivalDate?: string; // For Port
  location?: string; // For Warehouse
  daysInPort?: number; // Calculated KPI
  assignedTo?: { name: string; avatar: string; role: 'ANALYST' };
  slaDeadline?: string;
  activityLog?: Array<{ id: string; user: string; role: 'MANAGER' | 'ANALYST' | 'SYSTEM'; message: string; timestamp: string }>;
}

export type ColumnDefinition = {
  id: ContainerStatus;
  title: string;
  color: string;
};
