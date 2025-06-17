
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface SystemStatus {
  cpu: number;
  memory: number;
  temperature: number;
  battery: number;
  solar: number;
  wifi: boolean;
  camera: boolean;
  microphone: boolean;
  smartGlasses: boolean;
}

export interface VoiceCommand {
  id: string;
  timestamp: string;
  command: string;
  confidence: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface ClusterNode {
  id: string;
  name: string;
  type: 'jetson-nano-2gb' | 'orin-nano';
  status: 'online' | 'offline' | 'busy';
  ip: string;
  workload: number;
  temperature: number;
  lastSeen: string;
}

interface AgentState {
  // System state
  systemStatus: SystemStatus;
  agentActive: boolean;
  currentMode: 'voice' | 'visual' | 'cluster';
  
  // Voice agent state
  isListening: boolean;
  currentCommand: string;
  commandHistory: VoiceCommand[];
  whisperStatus: 'idle' | 'processing' | 'ready';
  ttsEnabled: boolean;
  ohoConnected: boolean;
  
  // Cluster state
  clusterNodes: ClusterNode[];
  selectedNodes: string[];
  
  // WebSocket connection
  wsConnected: boolean;
  wsReconnectAttempts: number;
  
  // Security & audit
  auditLogs: Array<{
    timestamp: string;
    action: string;
    details: any;
    userId?: string;
  }>;
  
  // Actions
  setSystemStatus: (status: Partial<SystemStatus>) => void;
  setAgentActive: (active: boolean) => void;
  setCurrentMode: (mode: 'voice' | 'visual' | 'cluster') => void;
  setListening: (listening: boolean) => void;
  setCurrentCommand: (command: string) => void;
  addCommandToHistory: (command: VoiceCommand) => void;
  updateCommandStatus: (id: string, status: VoiceCommand['status']) => void;
  setWhisperStatus: (status: 'idle' | 'processing' | 'ready') => void;
  setTtsEnabled: (enabled: boolean) => void;
  setOhoConnected: (connected: boolean) => void;
  updateClusterNode: (node: ClusterNode) => void;
  removeClusterNode: (id: string) => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  setWsConnected: (connected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  addAuditLog: (action: string, details: any, userId?: string) => void;
}

export const useAgentStore = create<AgentState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    systemStatus: {
      cpu: 45,
      memory: 68,
      temperature: 52,
      battery: 85,
      solar: 65,
      wifi: true,
      camera: true,
      microphone: true,
      smartGlasses: false,
    },
    agentActive: false,
    currentMode: 'voice',
    isListening: false,
    currentCommand: '',
    commandHistory: [],
    whisperStatus: 'idle',
    ttsEnabled: true,
    ohoConnected: false,
    clusterNodes: [],
    selectedNodes: [],
    wsConnected: false,
    wsReconnectAttempts: 0,
    auditLogs: [],
    
    // Actions
    setSystemStatus: (status) => 
      set((state) => ({ 
        systemStatus: { ...state.systemStatus, ...status }
      })),
    
    setAgentActive: (active) => {
      set({ agentActive: active });
      get().addAuditLog('agent_toggle', { active });
    },
    
    setCurrentMode: (mode) => {
      set({ currentMode: mode });
      get().addAuditLog('mode_change', { mode });
    },
    
    setListening: (listening) => {
      set({ isListening: listening });
      get().addAuditLog('voice_listening', { listening });
    },
    
    setCurrentCommand: (command) => set({ currentCommand: command }),
    
    addCommandToHistory: (command) =>
      set((state) => ({ 
        commandHistory: [command, ...state.commandHistory.slice(0, 9)]
      })),
    
    updateCommandStatus: (id, status) =>
      set((state) => ({
        commandHistory: state.commandHistory.map(cmd =>
          cmd.id === id ? { ...cmd, status } : cmd
        )
      })),
    
    setWhisperStatus: (status) => set({ whisperStatus: status }),
    setTtsEnabled: (enabled) => set({ ttsEnabled: enabled }),
    setOhoConnected: (connected) => set({ ohoConnected: connected }),
    
    updateClusterNode: (node) =>
      set((state) => {
        const existing = state.clusterNodes.findIndex(n => n.id === node.id);
        if (existing >= 0) {
          const newNodes = [...state.clusterNodes];
          newNodes[existing] = node;
          return { clusterNodes: newNodes };
        }
        return { clusterNodes: [...state.clusterNodes, node] };
      }),
    
    removeClusterNode: (id) =>
      set((state) => ({
        clusterNodes: state.clusterNodes.filter(n => n.id !== id)
      })),
    
    setSelectedNodes: (nodeIds) => set({ selectedNodes: nodeIds }),
    setWsConnected: (connected) => set({ wsConnected: connected }),
    incrementReconnectAttempts: () => 
      set((state) => ({ wsReconnectAttempts: state.wsReconnectAttempts + 1 })),
    resetReconnectAttempts: () => set({ wsReconnectAttempts: 0 }),
    
    addAuditLog: (action, details, userId) =>
      set((state) => ({
        auditLogs: [
          {
            timestamp: new Date().toISOString(),
            action,
            details,
            userId
          },
          ...state.auditLogs.slice(0, 99) // Keep last 100 logs
        ]
      }))
  }))
);
