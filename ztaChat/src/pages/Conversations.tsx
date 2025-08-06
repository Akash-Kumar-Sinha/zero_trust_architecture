import Header from "@/components/Shared/Header";
import { useAppSelector } from "@/utils/Hooks/redux";

const Conversations = () => {
  const { activeConversation } = useAppSelector((state) => state.conversations);
  const { userProfile } = useAppSelector((state) => state.user);

  const chatUser =
    activeConversation?.Profile1.Username === userProfile?.Username
      ? activeConversation?.Profile2
      : activeConversation?.Profile1;
  return (
    <div>
      <Header
        url={"/home"}
        navTitle="Chats"
        title={chatUser?.Username || "No Chat Selected"}
      />
    </div>
  );
};

export default Conversations;
