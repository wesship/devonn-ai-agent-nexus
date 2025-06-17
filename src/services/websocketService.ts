
import { useAgentStore } from '@/store/agentStore';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;

  connect(url: string = 'ws://localhost:5002') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        useAgentStore.getState().setWsConnected(true);
        useAgentStore.getState().resetReconnectAttempts();
        useAgentStore.getState().addAuditLog('websocket_connected', { url });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        useAgentStore.getState().setWsConnected(false);
        this.scheduleReconnect(url);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        useAgentStore.getState().addAuditLog('websocket_error', { error: error.toString() });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  private scheduleReconnect(url: string) {
    const store = useAgentStore.getState();
    
    if (store.wsReconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    store.incrementReconnectAttempts();
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect... (${store.wsReconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect(url);
    }, this.reconnectDelay);
  }

  private handleMessage(data: any) {
    const store = useAgentStore.getState();
    
    switch (data.type) {
      case 'system_status':
        store.setSystemStatus(data.payload);
        break;
        
      case 'voice_command':
        store.addCommandToHistory({
          id: data.payload.id,
          timestamp: data.payload.timestamp,
          command: data.payload.command,
          confidence: data.payload.confidence,
          status: 'processing'
        });
        break;
        
      case 'cluster_update':
        store.updateClusterNode(data.payload);
        break;
        
      case 'agent_response':
        if (data.payload.commandId) {
          store.updateCommandStatus(data.payload.commandId, 'completed');
        }
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
    
    store.addAuditLog('websocket_message', { type: data.type, payload: data.payload });
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
      useAgentStore.getState().addAuditLog('websocket_send', { type, payload });
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    useAgentStore.getState().setWsConnected(false);
  }
}

export const websocketService = new WebSocketService();
