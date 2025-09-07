export interface StoreInfo {
  name: string;
  store: any;
  state: any;
}

export type ViewMode = 'json' | 'history' | 'graph' | 'settings';

export interface HistoryEntry {
  ts: number;
  snapshot: any;
}

export interface GraphNode {
  id: string;
  label: string;
  depth: number;
  kind: 'object' | 'value';
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface DevtoolsSettings {
  history: {
    maxHistory: number;
    playbackMs: number;
    recording: boolean;
  };
  graph: {
    maxDepth: number;
    fitWidth: boolean;
  };
  json: {
    expandByDefault: boolean;
  };
}
