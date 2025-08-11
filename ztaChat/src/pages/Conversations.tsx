import Header from "@/components/Shared/Header";
import { useAppSelector, useAppDispatch } from "@/utils/Hooks/redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import MessagesBox from "@/components/Messages/MessagesBox";
import { useEffect, useState } from "react";
import { useGlobalWebSocket } from "@/hooks/useGlobalWebSocket";
import { setConnectionInfo } from "@/features/socketSlice";

const Conversations = () => {
  const { activeConversation } = useAppSelector((state) => state.conversations);
  const { userProfile } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [input, setInput] = useState("");
  const [realtimeMessage, setRealtimeMessage] = useState<string>("");
  const [realtimeMessageSender, setRealtimeMessageSender] = useState<
    number | undefined
  >();

  const {
    isConnected,
    connect,
    sendMessage: wsSendMessage,
    socket,
  } = useGlobalWebSocket();

  const chatUser =
    activeConversation?.Profile1.Username === userProfile?.Username
      ? activeConversation?.Profile2
      : activeConversation?.Profile1;

  useEffect(() => {
    if (activeConversation?.ID && userProfile?.ID) {
      connect(activeConversation.ID, userProfile.ID).catch(console.error);

      dispatch(
        setConnectionInfo({
          conversationId: activeConversation.ID,
          profileId: userProfile.ID,
        })
      );
    }
  }, [activeConversation?.ID, userProfile?.ID, connect, dispatch]);

  useEffect(() => {
    if (socket) {
      const handleMessage = (event: MessageEvent) => {
        console.log("📩 Received:", event.data);
        setRealtimeMessage(event.data);
        setRealtimeMessageSender(userProfile?.ID === 1 ? 2 : 1);
      };

      socket.addEventListener("message", handleMessage);

      return () => {
        socket.removeEventListener("message", handleMessage);
      };
    }
  }, [socket, userProfile?.ID]);

  const sendMessage = () => {
    if (!input.trim()) {
      console.warn("⚠️ Cannot send empty message");
      return;
    }

    if (wsSendMessage(input)) {
      setRealtimeMessage(input);
      setRealtimeMessageSender(userProfile?.ID);
      setInput(""); 
    } else {
      console.warn("⚠️ Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <Header
          url={"/home"}
          navTitle="Chats"
          title={chatUser?.Username || "No Chat Selected"}
        />
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          <MessagesBox
            conversationId={activeConversation?.ID}
            userId={userProfile?.ID}
            newMessage={realtimeMessage}
            newMessageSender={realtimeMessageSender}
          />
        </div>

        <div className=" bg-card/95 backdrop-blur-sm p-4">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                value={input}
                placeholder={
                  isConnected ? "Type your message..." : "Connecting..."
                }
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                className={`bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring pr-12 rounded-xl transition-all duration-200 ${
                  !isConnected ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || !isConnected}
              className={`bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl p-3 transition-all duration-200 ${
                input.trim() && isConnected
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-50"
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • {isConnected ? "Connected" : "Connecting..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversations;
