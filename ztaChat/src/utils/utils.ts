import { load } from "@tauri-apps/plugin-store";

export const getAuthToken = async () => {
  const store = await load("store.json");

  const token = await store.get("zta_auth_token");

  return token;
};
export const authHeaders = async () => {
  const token = await getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};
