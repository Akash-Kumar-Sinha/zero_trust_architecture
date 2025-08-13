import RequestCard from "@/components/FriendRequests/RequestCard";
import { Button } from "@/components/ui/button";
import { USER_SERVER_URL } from "@/utils/constant";
import { useAppSelector } from "@/utils/Hooks/redux";
import { type FriendRequests } from "@/utils/type";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Users, RefreshCw, Inbox } from "lucide-react";

const FriendRequests = () => {
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAppSelector((state) => state.user);
  const [friendRequests, setFriendRequests] = useState<FriendRequests[]>([]);
  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${USER_SERVER_URL}/get_friend_requests`,
        {
          params: {
            id: userProfile?.ID,
          },
        }
      );
      if (data?.success) {
        setFriendRequests(data.requests || []);
      } else {
        console.error("Failed to fetch friend requests");
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const handleAcceptRequest = async (
    requestId: number,
    senderUsername: string
  ) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${USER_SERVER_URL}/accept_friend_request`,
        {
          request_id: requestId,
          sender_username: senderUsername,
          current_user: userProfile?.Username,
        }
      );
      if (data?.success) {
        fetchFriendRequests();
      } else {
        console.error("Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--accent)]/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl text-white"
              >
                <UserPlus className="w-6 h-6" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  Friend Requests
                </h1>
                <p className="text-[var(--muted-foreground)] mt-1">
                  Manage your incoming friend requests
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={fetchFriendRequests}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-lg transition-all duration-300 gap-2"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-sm bg-[var(--sidebar-background)]/80 rounded-2xl border border-[var(--sidebar-border)] shadow-xl"
        >
          <AnimatePresence mode="wait">
            {friendRequests.length > 0 ? (
              <RequestCard
                FriendRequests={friendRequests}
                loading={loading}
                handleFriendRequest={handleAcceptRequest}
              />
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="p-12 text-center"
              >
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mb-6"
                >
                  <Inbox className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                    No Friend Requests
                  </h3>
                  <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
                    You don't have any pending friend requests at the moment.
                    When someone sends you a request, it will appear here.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]"
                >
                  <Users className="w-4 h-4" />
                  <span>Share your username to connect with friends</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default FriendRequests;
