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
      console.log("Checking app-level authentication...");

      // Load stored data into Redux if not already loaded
      const storeState = await dispatch(loadStoredData()).unwrap();
      const email = storeState.userEmail;
      const token = storeState.authToken;

      console.log("Email:", email, "Token exists:", !!token);

      if (!email || !token || email === "" || token === "") {
        console.log("No credentials found");
        setAuthStatus("UNAUTHENTICATED");
        return;
      }

      console.log("Found credentials, verifying with server...");
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
        console.log("User is authenticated");
        setAuthStatus("AUTHENTICATED");

        // Fetch user profile once authenticated
        console.log("🔄 Dispatching fetchUserProfile...");
        dispatch(fetchUserProfile());

        if (location.pathname === "/auth") {
          console.log("Authenticated user on auth page, redirecting to /home");
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
