import { Profile } from "@/utils/type";

export interface SidebarItem {
  title: string;
  url: string;
  isActive?: boolean;
}

export interface SidebarNavMain {
  title: string;
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
        title: "Chats",
        url: "#",
        items: friends.map((friend) => ({
          title: friend.Username,
          url: `/chat/${friend.ID}`,
        })),
      },
    ],
  };
};
