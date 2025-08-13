import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAppDispatch } from "@/utils/Hooks/redux";
import { setConnected, setError, addMessage } from "@/features/socketSlice";

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  connect: (conversationId: number, profileId: number) => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const currentConversationId = useRef<number | null>(null);
  const isConnectingRef = useRef(false);

  const connect = useCallback(
    async (conversationId: number, profileId: number): Promise<void> => {
      if (!conversationId || !profileId) {
        const errorMsg = "Missing conversationId or profileId";
        setErrorState(errorMsg);
        dispatch(setError(errorMsg));
        throw new Error(errorMsg);
      }

      return new Promise((resolve, reject) => {
        try {
          if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN &&
            currentConversationId.current === conversationId
          ) {
            console.log("✅ Already connected to this conversation");
            resolve();
            return;
          }

          if (isConnectingRef.current) {
            console.log("⏳ Connection already in progress");
            return;
          }

          if (socketRef.current) {
            socketRef.current.close();
          }

          isConnectingRef.current = true;

          const url = `ws://localhost:8080/ws?conversationId=${conversationId}&profileId=${profileId}`;
          console.log("🔌 Connecting to:", url);

          const ws = new WebSocket(url);
          socketRef.current = ws;
          currentConversationId.current = conversationId;

          ws.onopen = () => {
            console.log("✅ WebSocket connected");
            isConnectingRef.current = false;
            setSocket(ws);
            setIsConnected(true);
            setErrorState(null);
            dispatch(setConnected(true));
            resolve();
          };

          ws.onmessage = (event) => {
            console.log("📩 Received:", event.data);
            dispatch(addMessage(event.data));
          };

          ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            isConnectingRef.current = false;
            const errorMsg = "WebSocket connection error";
            setErrorState(errorMsg);
            dispatch(setError(errorMsg));
            reject(error);
          };

          ws.onclose = (event) => {
            console.log(
              "🔌 WebSocket closed, code:",
              event.code,
              "reason:",
              event.reason
            );
            isConnectingRef.current = false;
            setSocket(null);
            setIsConnected(false);
            dispatch(setConnected(false));
            socketRef.current = null;
            currentConversationId.current = null;
          };
        } catch (error) {
          console.error("Failed to create WebSocket:", error);
          isConnectingRef.current = false;
          const errorMsg = "Failed to create WebSocket";
          setErrorState(errorMsg);
          dispatch(setError(errorMsg));
          reject(error);
        }
      });
    },
    [dispatch]
  );

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      currentConversationId.current = null;
      setSocket(null);
      setIsConnected(false);
      setErrorState(null);
      dispatch(setConnected(false));
    }
  }, [dispatch]);

  const sendMessage = useCallback((message: string): boolean => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
      console.log("📤 Sent:", message);
      return true;
    }
    console.warn("⚠️ WebSocket not connected");
    return false;
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
