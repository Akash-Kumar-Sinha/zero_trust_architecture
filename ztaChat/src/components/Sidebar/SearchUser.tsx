import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Input } from "../ui/input";
import axios from "axios";
import { USER_SERVER_URL } from "@/utils/constant";
import { UserProfile } from "@/utils/type";
import ProfileSearch from "./ProfileSearch";
import { Skeleton } from "../ui/skeleton";
import { useAppSelector } from "@/utils/Hooks/redux";
import { authHeaders } from "@/utils/utils";
import { useEffect } from "react";

const SearchUser = () => {
  const [loading, setLoading] = React.useState(false);
  const [usernameInput, setUsernameInput] = React.useState("");
  const [profiles, setProfiles] = React.useState<UserProfile[]>([]);
  const { userProfile } = useAppSelector((state) => state.user);

  const fetchUsersByUsername = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${USER_SERVER_URL}/search_users`, {
        params: {
          username: usernameInput,
          currentUser: userProfile?.Username,
        },
      });
      const users = data?.users || [];
      setProfiles(Array.isArray(users) ? users : []);
    } catch (error) {
      console.log("Error in fetching users: ", error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (username: string) => {
    try {
      const { headers } = await authHeaders();
      const { data } = await axios.put(
        `${USER_SERVER_URL}/send_friend_request`,
        { username },
        { headers }
      );
      if (data?.success) {
        console.log(`Friend request sent to ${username}`);
      } else {
        console.error(`Failed to send friend request to ${username}`);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  useEffect(() => {
    if (usernameInput.trim()) {
      const debounceTimer = setTimeout(() => {
        setLoading(true);
        fetchUsersByUsername();
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setProfiles([]);
    }
  }, [usernameInput]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
            <Input
              placeholder="Search users..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              disabled={loading}
              className="pl-10 h-9 bg-sidebar-accent/30 border-sidebar-border/50 focus:border-sidebar-primary/60 focus:ring-sidebar-primary/20 placeholder:text-sidebar-foreground/50 text-sidebar-foreground rounded-lg transition-all duration-300 hover:bg-sidebar-accent/40"
            />
            {loading && (
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-4 h-4 border-2 border-sidebar-primary/30 border-t-sidebar-primary rounded-full" />
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading && usernameInput && (
              <motion.div
                className="px-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Skeleton className="h-12 w-full bg-sidebar-accent/30 rounded-lg" />
              </motion.div>
            )}

            {!loading &&
              usernameInput &&
              Array.isArray(profiles) &&
              profiles.length > 0 && (
                <motion.div
                  className="space-y-1 max-h-96 overflow-y-auto px-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {profiles.map((profile, index) => (
                    <motion.div
                      key={profile.ID?.toString() || profile.Username}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <ProfileSearch
                        profile={profile}
                        sendFriendRequest={sendFriendRequest}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

            {!loading &&
              usernameInput &&
              (!profiles ||
                (Array.isArray(profiles) && profiles.length === 0)) && (
                <motion.div
                  className="text-xs text-sidebar-foreground/60 p-2 text-center bg-sidebar-accent/20 rounded-lg border border-sidebar-border/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  No users found for "{usernameInput}"
                </motion.div>
              )}
          </AnimatePresence>
        </motion.div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SearchUser;
