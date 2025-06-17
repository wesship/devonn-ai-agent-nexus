
import { useEffect } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { websocketService } from '@/services/websocketService';

export const useWebSocket = (url?: string) => {
  const wsConnected = useAgentStore((state) => state.wsConnected);
  const reconnectAttempts = useAgentStore((state) => state.wsReconnectAttempts);

  useEffect(() => {
    websocketService.connect(url);
    
    return () => {
      websocketService.disconnect();
    };
  }, [url]);

  const sendMessage = (type: string, payload: any) => {
    websocketService.send(type, payload);
  };

  return {
    connected: wsConnected,
    reconnectAttempts,
    sendMessage
  };
};
