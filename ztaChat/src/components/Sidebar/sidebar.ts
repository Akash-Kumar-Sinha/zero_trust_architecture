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

export const chats = [
  { id: "chat1", name: "Alice" },
  { id: "chat2", name: "Bob" },
  { id: "chat3", name: "Charlie" },
];

export const data: SidebarData = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Chats",
      url: "#",
      items: chats.map(chat => ({
        title: chat.name,
        url: `/chat/${chat.id}`, 
      })),
    },
  ],
};
