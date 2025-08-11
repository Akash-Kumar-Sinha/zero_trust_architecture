import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useAppSelector } from "@/utils/Hooks/redux";

/**
 * A simple hook that provides WebSocket functionality
 * Can be used anywhere in the app after the WebSocketProvider is set up
 */
export const useGlobalWebSocket = () => {
  const webSocketContext = useWebSocketContext();
  const { connected, connectionInfo } = useAppSelector((state) => state.socket);

  return {
    // Connection state
    isConnected: webSocketContext.isConnected,
    error: webSocketContext.error,
    connectionInfo,
    socket: webSocketContext.socket, // Expose socket for direct access

    // Connection methods
    connect: webSocketContext.connect,
    disconnect: webSocketContext.disconnect,

    // Message sending
    sendMessage: webSocketContext.sendMessage,

    // Redux connection state (for components that need it)
    reduxConnected: connected,
  };
};
