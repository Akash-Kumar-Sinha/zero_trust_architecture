import { useEffect, useState } from "react";
import useCurrentUser from "./useCurrentUser";
import { Profile } from "../type";
import axios from "axios";
import { USER_SERVER_URL } from "../constant";

const useFriends = () => {
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const { userProfile } = useCurrentUser();
  const getFriends = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${USER_SERVER_URL}/get_friends`, {
        params: {
          id: userProfile?.ID,
        },
      });
      console.log("Friend  data:", data);
      if (data?.success) {
        setFriends(data.data || []); 
      } else {
        console.error("Failed to fetch friends");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.ID) {
      getFriends();
    }
  }, [userProfile?.ID]);

  return {
    friends,
    loading,
    getFriends,
  };
};

export default useFriends;
