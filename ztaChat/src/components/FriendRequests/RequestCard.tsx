import { type FriendRequests } from "@/utils/type";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, Check, Loader2 } from "lucide-react";

interface RequestCardProps {
  FriendRequests: FriendRequests[];
  loading: boolean;
  handleFriendRequest: (requestId: number, senderUsername: string) => void;
}

const RequestCard = ({
  FriendRequests,
  loading,
  handleFriendRequest,
}: RequestCardProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading friend requests...</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            {FriendRequests.map((request, index) => (
              <motion.div
                key={request.ID.toString()}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                <div className="relative flex items-center justify-between p-4 bg-[var(--background)]/50 backdrop-blur-sm border border-[var(--sidebar-border)] rounded-xl hover:border-[var(--primary)]/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="p-2 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full"
                    >
                      <User className="w-5 h-5 text-[var(--primary)]" />
                    </motion.div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--foreground)] text-lg">
                          {request.Requester?.Username}
                        </span>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                          className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]"
                        >
                          <Clock className="w-3 h-3" />
                          <span>sent you a friend request</span>
                        </motion.div>
                      </div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="text-sm text-[var(--muted-foreground)] mt-1"
                      >
                        Click accept to add them to your friends list
                      </motion.p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() =>
                        handleFriendRequest(
                          request.ID,
                          request.Requester?.Username ?? ""
                        )
                      }
                      className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-lg transition-all duration-300 gap-2 min-w-[100px]"
                      disabled={!request.Requester?.Username || loading}
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestCard;
