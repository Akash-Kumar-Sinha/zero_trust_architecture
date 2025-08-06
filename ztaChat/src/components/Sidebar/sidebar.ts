import { Profile } from "@/utils/type";

export interface SidebarItem {
  username: string;
  url: string;
  isActive?: boolean;
}

export interface SidebarNavMain {
  username: string;
  url: string;
  items: SidebarItem[];
}

export interface SidebarData {
  versions: string[];
  navMain: SidebarNavMain[];
}

export const getSidebarData = (friends: Profile[]): SidebarData => {
  return {
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    navMain: [
      {
        username: "Chats",
        url: "#",
        items: friends.map((friend) => ({
          username: friend.Username,
          url: `/chat/${friend.ID}`,
        })),
      },
    ],
  };
};
