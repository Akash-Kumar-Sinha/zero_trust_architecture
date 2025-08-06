import * as React from "react";

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
        <div className="space-y-2">
          <Input
            placeholder="Search by username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            disabled={loading}
          />

          {loading && usernameInput && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-full" />
            </div>
          )}

          {!loading &&
            usernameInput &&
            Array.isArray(profiles) &&
            profiles.length > 0 && (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <ProfileSearch
                    key={profile.ID?.toString() || profile.Username}
                    profile={profile}
                    sendFriendRequest={sendFriendRequest}
                  />
                ))}
              </div>
            )}

          {!loading &&
            usernameInput &&
            (!profiles ||
              (Array.isArray(profiles) && profiles.length === 0)) && (
              <div className="text-sm text-muted-foreground p-2">
                No users found for "{usernameInput}"
              </div>
            )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SearchUser;
