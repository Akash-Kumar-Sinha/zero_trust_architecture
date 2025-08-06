import * as React from "react";
import { useLocation, Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getSidebarData } from "./sidebar";
import SearchUser from "./SearchUser";
import { NavUser } from "./NavUser";
import useCurrentUser from "@/utils/Hooks/useCurrentUser";
import { Skeleton } from "../ui/skeleton";
import useFriends from "@/utils/Hooks/useFriends";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { userProfile } = useCurrentUser();
  const {friends} = useFriends();

  const data = getSidebarData(friends);
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchUser />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {!userProfile ? (
          <div className="flex items-center gap-2 w-full">
            <Skeleton className="h-6 w-6 rounded-lg" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <NavUser user={userProfile} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
