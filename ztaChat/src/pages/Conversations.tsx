import Header from "@/components/Shared/Header";
import { useAppSelector, useAppDispatch } from "@/utils/Hooks/redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import MessagesBox from "@/components/Messages/MessagesBox";
import { useEffect, useState } from "react";
import { useGlobalWebSocket } from "@/hooks/useGlobalWebSocket";
import { setConnectionInfo } from "@/features/socketSlice";
import { motion } from "framer-motion";

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        className="sticky top-0 z-10 border-b border-[var(--sidebar-border)] bg-gradient-to-r from-card/98 via-card/95 to-card/98 backdrop-blur-xl shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Header
          url={"/home"}
          navTitle="Chats"
          title={chatUser?.Username || "No Chat Selected"}
        />
      </motion.div>

      <div className="flex flex-col flex-1 min-h-0">
        <motion.div
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-muted/5 to-muted/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <MessagesBox
            conversationId={activeConversation?.ID}
            userId={userProfile?.ID}
            newMessage={realtimeMessage}
            newMessageSender={realtimeMessageSender}
          />
        </motion.div>

        <motion.div
          className="bg-gradient-to-t from-card/98 via-card/95 to-card/90 backdrop-blur-xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex gap-4 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  value={input}
                  placeholder={
                    isConnected ? "Type your message..." : "Connecting..."
                  }
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  className={`
                    bg-background 
                    border-0
                    focus:border-0 
                    focus:ring-0
                    rounded-2xl px-4 py-4 text-base
                    placeholder:text-muted-foreground/60
                    transition-all duration-300 ease-out
                    ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                />
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || !isConnected}
                className={`
                  bg-primary hover:bg-primary/90
                  text-primary-foreground
                  rounded-2xl px-5 py-4 h-auto
                  transition-all duration-200
                  ${
                    !input.trim() || !isConnected
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                <motion.div
                  animate={{
                    rotate: input.trim() && isConnected ? 0 : -5,
                    scale: input.trim() && isConnected ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="text-xs text-muted-foreground/70 mt-4 text-center flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-orange-500"
              }`}
              animate={{
                scale: isConnected ? [1, 1.2, 1] : [1, 0.8, 1],
                opacity: isConnected ? [1, 0.7, 1] : [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            Press Enter to send •{" "}
            {isConnected ? "Connected & Encrypted" : "Connecting..."}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Conversations;
