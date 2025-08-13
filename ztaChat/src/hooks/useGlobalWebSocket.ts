import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useAppSelector } from "@/utils/Hooks/redux";

export const useGlobalWebSocket = () => {
  const webSocketContext = useWebSocketContext();
  const { connected, connectionInfo } = useAppSelector((state) => state.socket);

  return {
    isConnected: webSocketContext.isConnected,
    error: webSocketContext.error,
    connectionInfo,
    socket: webSocketContext.socket, 

    connect: webSocketContext.connect,
    disconnect: webSocketContext.disconnect,

    sendMessage: webSocketContext.sendMessage,

    reduxConnected: connected,
  };
};
