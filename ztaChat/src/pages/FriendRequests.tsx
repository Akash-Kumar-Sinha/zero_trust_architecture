import RequestCard from "@/components/FriendRequests/RequestCard";
import { Button } from "@/components/ui/button";
import { USER_SERVER_URL } from "@/utils/constant";
import useCurrentUser from "@/utils/Hooks/useCurrentUser";
import { type FriendRequests } from "@/utils/type";
import axios from "axios";
import { useEffect, useState } from "react";

const FriendRequests = () => {
  const [loading, setLoading] = useState(false);
  const { userProfile } = useCurrentUser();
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
    <div className="relative">
      <Button onClick={fetchFriendRequests} className="fixed right-4">
        Refresh Friend Requests
      </Button>
      {friendRequests.length > 0 ? (
        <RequestCard
          FriendRequests={friendRequests}
          loading={loading}
          handleFriendRequest={handleAcceptRequest}
        />
      ) : (
        <p>No friend requests found.</p>
      )}
    </div>
  );
};

export default FriendRequests;
