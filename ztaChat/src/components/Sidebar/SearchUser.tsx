import * as React from "react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Input } from "../ui/input";
import axios from "axios";
import { USER_SERVER_URL } from "@/utils/constant";
import { UserProfile } from "@/utils/type";
import ProfileSearch from "./ProfileSearch";
import { Skeleton } from "../ui/skeleton";

const Profile = () => {
  const [loading, setLoading] = React.useState(false);
  const [usernameInput, setUsernameInput] = React.useState("");
  const [profiles, setProfiles] = React.useState<UserProfile[]>([]);

  const fetchUsersByUsername = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${USER_SERVER_URL}/search_users`, {
        params: {
          username: usernameInput,
        },
      });
      console.log("Fetched users: ", data.users);
      // Handle null/undefined users array safely
      const users = data?.users || [];
      setProfiles(Array.isArray(users) ? users : []);
    } catch (error) {
      console.log("Error in fetching users: ", error);
      // Reset profiles to empty array on error
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = (username: string) => {
    console.log("Selected user:", username);
    // Add logic here to handle user selection (e.g., start chat, view profile, etc.)
  };

  React.useEffect(() => {
    if (usernameInput.trim()) {
      const debounceTimer = setTimeout(() => {
        setLoading(true);
        fetchUsersByUsername();
      }, 300); // 300ms debounce

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

export default Profile;
