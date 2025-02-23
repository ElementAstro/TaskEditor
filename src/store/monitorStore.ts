import { create } from 'zustand';

export interface TelescopeStatus {
  ra: number;
  dec: number;
  pier: 'east' | 'west';
  tracking: boolean;
  connected: boolean;
}

export interface CameraStatus {
  temperature: number;
  cooling: boolean;
  connected: boolean;
  gain: number;
  offset: number;
}

export interface GuidingStatus {
  enabled: boolean;
  rmsRA: number;
  rmsDEC: number;
  exposure: number;
  connected: boolean;
}

export interface PerformanceMetrics {
  timestamp: number;
  cpu: number;
  fps: number;
  memory: {
    used: number;
    total: number;
  };
}

interface MonitorStore {
  isMonitorOpen: boolean;
  activeTab: string;
  telescopeStatus: TelescopeStatus | null;
  cameraStatus: CameraStatus | null;
  guidingStatus: GuidingStatus | null;
  performanceMetrics: PerformanceMetrics[];
  logs: {
    timestamp: Date;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    nodeId?: string;
  }[];
  setIsMonitorOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  updateTelescopeStatus: (status: TelescopeStatus) => void;
  updateCameraStatus: (status: CameraStatus) => void;
  updateGuidingStatus: (status: GuidingStatus) => void;
  updatePerformanceMetrics: (metrics: PerformanceMetrics) => void;
  addLog: (log: Omit<MonitorStore['logs'][0], 'timestamp'>) => void;
  clearLogs: () => void;
}

const useMonitorStore = create<MonitorStore>((set) => ({
  isMonitorOpen: false,
  activeTab: 'devices',
  telescopeStatus: null,
  cameraStatus: null,
  guidingStatus: null,
  performanceMetrics: [],
  logs: [],

  setIsMonitorOpen: (isOpen) => set({ isMonitorOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  updateTelescopeStatus: (status) => set({ telescopeStatus: status }),
  updateCameraStatus: (status) => set({ cameraStatus: status }),
  updateGuidingStatus: (status) => set({ guidingStatus: status }),
  
  updatePerformanceMetrics: (metrics) => 
    set((state) => ({
      performanceMetrics: [...state.performanceMetrics.slice(-60), metrics]
    })),
    
  addLog: (log) => 
    set((state) => ({
      logs: [{ ...log, timestamp: new Date() }, ...state.logs.slice(0, 99)]
    })),
    
  clearLogs: () => set({ logs: [] }),
}));

export default useMonitorStore;