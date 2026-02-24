
export interface ForensicItem {
  id: string;
  source: string;
  timestamp: string;
  title: string;
  metadata: Record<string, any>;
  rawJson: string;
  hash: string;
  isFlagged?: boolean;
}

export interface ApiStatus {
  name: string;
  id: string;
  enabled: boolean;
  loading: boolean;
}

export enum ForensicCategoryType {
  MODULE = 'MODULE',
  SERVICE = 'SERVICE'
}

export interface ForensicCommand {
  id: string;
  label: string;
  description: string;
  category: string; 
  type: ForensicCategoryType;
  estimatedTime: string;
  endpoint?: string; // New: API Endpoint for Power User view
  method?: string;   // New: HTTP Method
}

export interface ExecutionQueueItem {
  uid: string;
  commandId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'ERROR';
}

export interface ForensicSession {
  id: string;
  startTime: string;
  items: ForensicItem[];
  logs: string[];
}
