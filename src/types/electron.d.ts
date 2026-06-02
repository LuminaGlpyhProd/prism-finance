import type { FinanceSyncSnapshot } from "@/lib/sync/types";

export interface ElectronAPI {
  isElectron: boolean;
  startSyncHost: (authToken: string) => Promise<{ port: number; addresses: string[] }>;
  stopSyncHost: () => Promise<boolean>;
  getLanAddresses: () => Promise<string[]>;
  pushSyncState: (state: FinanceSyncSnapshot) => void;
  onSyncRemoteState: (callback: (payload: FinanceSyncSnapshot) => void) => () => void;
  onSyncNeedState: (callback: () => void) => () => void;
  setOpenAtLogin: (enabled: boolean) => Promise<boolean>;
  getOpenAtLogin: () => Promise<boolean>;
  checkForUpdates: () => Promise<unknown>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
