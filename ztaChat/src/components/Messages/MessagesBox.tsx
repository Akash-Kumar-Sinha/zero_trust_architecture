import { USER_SERVER_URL } from "@/utils/constant";
import { Message } from "@/utils/type";
import axios from "axios";
import { useEffect, useState, useRef } from "react";

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

  return (
    <div className="space-y-4 pb-4">
      {messages.map((message, index) => {
        const isOwn = message.senderId === userId;
        const isLastInGroup =
          index === messages.length - 1 ||
          messages[index + 1]?.senderId !== message.senderId;

        return (
          <div
            key={index}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                isOwn
                  ? `bg-primary text-primary-foreground ml-12 ${
                      isLastInGroup
                        ? "rounded-2xl rounded-br-md"
                        : "rounded-2xl rounded-br-lg"
                    }`
                  : `bg-card text-card-foreground border border-border mr-12 ${
                      isLastInGroup
                        ? "rounded-2xl rounded-bl-md"
                        : "rounded-2xl rounded-bl-lg"
                    }`
              }`}
            >
              <div className="text-sm leading-relaxed break-words">
                {message.content}
              </div>
              <div
                className={`text-xs mt-2 ${
                  isOwn
                    ? "text-primary-foreground/70 text-right"
                    : "text-muted-foreground"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      })}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <div className="text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesBox;
