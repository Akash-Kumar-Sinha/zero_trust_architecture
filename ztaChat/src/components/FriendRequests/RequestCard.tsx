import { type FriendRequests } from "@/utils/type";
import { Button } from "../ui/button";

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
  return (
    <div className="bg-accent-foreground rounded-lg p-4 shadow-md mt-6">
      {loading ? (
        <p>Loading...</p>
      ) : (
        FriendRequests.map((request) => (
          <div
            key={request.ID.toString()}
            className="flex flex-row gap-2 items-center mb-4 p-2 border-b rounded-xl border-accent"
          >
            <span className="font-semibold text-accent">
              {request.Requester?.Username}
            </span>
            sent you a friend request
            <Button
              onClick={() =>
                handleFriendRequest(request.ID, request.Requester?.Username ?? "")
              }
              className="bg-accent"
              disabled={!request.Requester?.Username}
            >
              Accept
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default RequestCard;
