import { USER_SERVER_URL } from "@/utils/constant";
import { Message } from "@/utils/type";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lock } from "lucide-react";

interface MessageWithSender {
  content: string;
  senderId: number;
  timestamp: Date;
}

interface MessagesBoxProps {
  conversationId?: number;
  userId?: number;
  newMessage?: string;
  newMessageSender?: number;
}

const MessagesBox = ({
  conversationId,
  userId,
  newMessage,
  newMessageSender,
}: MessagesBoxProps) => {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const { data } = await axios.get(`${USER_SERVER_URL}/get_messages`, {
        params: {
          conversationId,
        },
      });

      console.log("Fetched messages:", data);

      if (data && data.data && Array.isArray(data.data)) {
        const allMessages: MessageWithSender[] = [];

        data.data.forEach((msg: Message) => {
          msg.Content.forEach((content) => {
            allMessages.push({
              content: content.Content,
              senderId: msg.SenderID,
              timestamp: new Date(msg.CreatedAt),
            });
          });
        });

        allMessages.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
        setMessages(allMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (newMessage && newMessageSender !== undefined) {
      const realtimeMessage: MessageWithSender = {
        content: newMessage,
        senderId: newMessageSender,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(
          (msg) =>
            msg.content === newMessage &&
            msg.senderId === newMessageSender &&
            Math.abs(
              msg.timestamp.getTime() - realtimeMessage.timestamp.getTime()
            ) < 1000
        );

        if (isDuplicate) {
          return prevMessages;
        }

        return [...prevMessages, realtimeMessage];
      });

      setTimeout(scrollToBottom, 100);
    }
  }, [newMessage, newMessageSender]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8,
      },
    },
  } as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
      },
    },
  } as const;

  return (
    <motion.div
      className="space-y-6 pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => {
          const isOwn = message.senderId === userId;
          const isLastInGroup =
            index === messages.length - 1 ||
            messages[index + 1]?.senderId !== message.senderId;
          const isFirstInGroup =
            index === 0 || messages[index - 1]?.senderId !== message.senderId;

          return (
            <motion.div
              key={`${
                message.senderId
              }-${message.timestamp.getTime()}-${index}`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              layout
              className={`flex ${
                isOwn ? "justify-end" : "justify-start"
              } group`}
            >
              <motion.div
                className={`
                  max-w-xs lg:max-w-md xl:max-w-lg 
                  px-5 py-4 
                  transition-all duration-300 ease-out
                  relative
                  ${
                    isOwn
                      ? `
                        bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]
                        text-[var(--primary-foreground)]
                        ml-12 
                        shadow-lg shadow-[var(--primary)]/20
                        ${
                          isLastInGroup
                            ? "rounded-3xl rounded-br-lg"
                            : "rounded-3xl rounded-br-2xl"
                        }
                        ${isFirstInGroup ? "mt-4" : "mt-1"}
                      `
                      : `
                        bg-gradient-to-br from-card/95 to-card/80 
                        text-card-foreground 
                        border-2 border-[var(--sidebar-border)]
                        mr-12 
                        shadow-lg shadow-black/5
                        backdrop-blur-sm
                        ${
                          isLastInGroup
                            ? "rounded-3xl rounded-bl-lg"
                            : "rounded-3xl rounded-bl-2xl"
                        }
                        ${isFirstInGroup ? "mt-4" : "mt-1"}
                      `
                  }
                `}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-[15px] leading-relaxed break-words font-medium">
                  {message.content}
                </div>

                <motion.div
                  className={`
                    flex items-center gap-2 mt-3 text-xs
                    ${
                      isOwn
                        ? "text-[var(--primary-foreground)]/70 justify-end"
                        : "text-muted-foreground justify-start"
                    }
                  `}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className={`
                    absolute -inset-1 rounded-3xl opacity-0 pointer-events-none
                    ${
                      isOwn
                        ? "bg-[var(--primary)]/20"
                        : "bg-gradient-to-br from-[var(--sidebar-border)]/50 to-[var(--sidebar-border)]/30"
                    }
                  `}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {messages.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-20 text-center"
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            💬
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-foreground">
              Start the conversation
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Send your first message to begin an end-to-end encrypted
              conversation.
            </p>

            <motion.div
              className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                Your messages are encrypted
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </motion.div>
  );
};

export default MessagesBox;
