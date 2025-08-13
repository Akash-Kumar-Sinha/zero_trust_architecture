import { UserProfile } from "@/utils/type";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";

interface ProfileSearchProps {
  profile: UserProfile;
  sendFriendRequest: (username: string) => void;
}

const ProfileSearch = ({ profile, sendFriendRequest }: ProfileSearchProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        key={profile.ID.toString()}
        onClick={() => sendFriendRequest(profile.Username)}
        className="cursor-pointer transition-all duration-300 bg-sidebar-accent/30 hover:bg-sidebar-accent/60 border-sidebar-border/30 hover:border-sidebar-primary/40 hover:shadow-lg backdrop-blur-sm rounded-xl group py-2"
        title="Click to send friend request"
      >
        <CardContent className="flex gap-3 items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-8 w-8 border-2 border-sidebar-primary/20 group-hover:border-sidebar-primary/40 transition-colors duration-300">
                <AvatarImage src={profile.ProfileImage} />
                <AvatarFallback className="bg-sidebar-primary/10 text-sidebar-primary font-semibold text-xs">
                  {profile.Username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <span className="text-sm text-sidebar-foreground font-medium truncate max-w-[120px] group-hover:text-sidebar-accent-foreground transition-colors duration-300">
              {profile.Username.slice(0, 16)}
            </span>
          </div>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UserPlus className="h-4 w-4 text-sidebar-primary group-hover:text-sidebar-primary/80 transition-colors duration-300" />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileSearch;
