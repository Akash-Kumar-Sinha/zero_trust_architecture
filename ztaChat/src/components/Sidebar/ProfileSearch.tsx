import { UserProfile } from "@/utils/type";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";

interface ProfileSearchProps {
  profile: UserProfile;
  sendFriendRequest: (username: string) => void;
}

const ProfileSearch = ({ profile, sendFriendRequest }: ProfileSearchProps) => {
  return (
    <Card
      key={profile.ID.toString()}
      onClick={() => sendFriendRequest(profile.Username)}
      className="cursor-pointer transition-all duration-200 ease-in-out hover:bg-accent/50 hover:border-accent hover:shadow-md hover:scale-[1.02] active:scale-[0.98] py-2"
      style={
        {
          "--hover-bg": "var(--color-accent)",
          "--hover-border": "var(--color-accent)",
          "--hover-shadow": "var(--color-accent)",
        } as React.CSSProperties
      }
      title="Click to send friend request"
    >
      <CardContent className="flex gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={profile.ProfileImage} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground">
            {profile.Username.slice(0, 16)}
          </span>
        </div>
        <UserPlus className="text-primary" />
      </CardContent>
    </Card>
  );
};

export default ProfileSearch;
