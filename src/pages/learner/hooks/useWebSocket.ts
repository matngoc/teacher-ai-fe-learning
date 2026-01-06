import { useCallback, useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onBinaryData?: (data: ArrayBuffer) => void;
  keepAliveInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const keepAliveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    onBinaryData,
    keepAliveInterval = 20000,
  } = options;

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (connectionTimerRef.current) {
      clearTimeout(connectionTimerRef.current);
      connectionTimerRef.current = null;
    }
  }, []);

  // Start keep-alive
  const startKeepAlive = useCallback(() => {
    clearTimers();
    keepAliveTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, keepAliveInterval);
  }, [keepAliveInterval, clearTimers]);

  // Connect to WebSocket
  const connect = useCallback((url: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      setIsConnecting(true);
      
      try {
        const ws = new WebSocket(url);
        ws.binaryType = 'arraybuffer'; // Set binary type for audio data
        wsRef.current = ws;

        // Connection timeout
        connectionTimerRef.current = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 30000);

        ws.onopen = () => {
          setIsConnected(true);
          setIsConnecting(false);
          clearTimers();
          startKeepAlive();
          onOpen?.();
          resolve();
        };

        ws.onclose = () => {
          setIsConnected(false);
          setIsConnecting(false);
          clearTimers();
          onClose?.();
        };

        ws.onerror = (error) => {
          setIsConnecting(false);
          clearTimers();
          onError?.(error);
          reject(error);
        };

        ws.onmessage = async (event) => {
          // Handle binary audio data
          if (event.data instanceof ArrayBuffer) {
            onBinaryData?.(event.data);
            return;
          }
          
          // Handle Blob (fallback for binary data)
          if (event.data instanceof Blob) {
            const arrayBuffer = await event.data.arrayBuffer();
            onBinaryData?.(arrayBuffer);
            return;
          }
          
          // Handle text/JSON messages
          try {
            const data = JSON.parse(event.data);
            onMessage?.(data);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };
      } catch (error) {
        setIsConnecting(false);
        reject(error);
      }
    });
  }, [onOpen, onClose, onError, onMessage, onBinaryData, startKeepAlive, clearTimers]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, [clearTimers]);

  // Send message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(payload);
      return true;
    }
    return false;
  }, []);

  // Send binary data
  const sendBinary = useCallback((data: ArrayBuffer | Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
      return true;
    }
    return false;
  }, []);

  // Get real-time connection state (not affected by stale closures)
  const getIsConnected = useCallback(() => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    sendBinary,
    getIsConnected,
    ws: wsRef.current,
  };
};
