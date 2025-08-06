import { useEffect, useState } from "react";
import { Profile } from "../type";
import axios from "axios";
import { USER_SERVER_URL } from "../constant";
import { load } from "@tauri-apps/plugin-store";
import { useNavigate } from "react-router";
import { authHeaders } from "../utils";

const useCurrentUser = () => {
  const [userProfile, setUserProfile] = useState<Profile>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const store = await load("store.json");
    await store.delete("zta_auth_token");
    await store.delete("u_email");
    await store.delete("zta_private_key");
    await store.save();
    setUserProfile(undefined);
    navigate("/auth");
  };

  const fetchUserProfile = async () => {
    const { headers } = await authHeaders();
    try {
      const { data } = await axios.get(
        `${USER_SERVER_URL}/current_user`,
        { headers }
      );
      console.log("data: ", data);
      setUserProfile(data.profile);
    } catch (error) {
      console.log("Unable to fetch users: ", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);
  return {
    userProfile,
    fetchUserProfile,
    handleLogout,
  };
};

export default useCurrentUser;
