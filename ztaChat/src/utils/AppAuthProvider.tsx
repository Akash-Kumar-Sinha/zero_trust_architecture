import React, { useEffect, useState } from "react";
import axios from "axios";
import { AUTH_SERVER_URL } from "./constant";
import { useNavigate, useLocation } from "react-router";
import { useAppDispatch } from "./Hooks/redux";
import { fetchUserProfile } from "@/features/userSlice";
import { loadStoredData } from "@/features/storeSlice";

type AUTH_STATUS = "LOADING" | "AUTHENTICATED" | "UNAUTHENTICATED";

const AppAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AUTH_STATUS>("LOADING");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const checkAuthentication = async () => {
    try {

      const storeState = await dispatch(loadStoredData()).unwrap();
      const email = storeState.userEmail;
      const token = storeState.authToken;

      if (!email || !token || email === "" || token === "") {
        console.log("No credentials found");
        setAuthStatus("UNAUTHENTICATED");
        return;
      }

      const { data } = await axios.get(
        `${AUTH_SERVER_URL}/auth_verifications`,
        {
          params: { email },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setAuthStatus("AUTHENTICATED");

        dispatch(fetchUserProfile());

        if (location.pathname === "/auth") {
          navigate("/home", { replace: true });
        }
      } else {
        console.log("Token verification failed");
        setAuthStatus("UNAUTHENTICATED");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setAuthStatus("UNAUTHENTICATED");
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  if (authStatus === "LOADING") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppAuthProvider;
