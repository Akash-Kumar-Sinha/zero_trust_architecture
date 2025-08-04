import React, { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import axios from "axios";
import { AUTH_SERVER_URL } from "./constant";
import { useNavigate, useLocation } from "react-router";

type AUTH_STATUS = "LOADING" | "AUTHENTICATED" | "UNAUTHENTICATED";

const AppAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AUTH_STATUS>("LOADING");
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthentication = async () => {
    try {
      console.log("Checking app-level authentication...");
      const store = await load("store.json", { autoSave: true });

      const email = await store.get("u_email");
      const token = await store.get("zta_auth_token");

      console.log(email, token)

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
