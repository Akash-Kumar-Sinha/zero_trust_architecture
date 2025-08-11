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
import { Skeleton } from "../ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/utils/Hooks/redux";
import { getConversations } from "@/features/conversationsSlice";
import { getFriends } from "@/features/friendsSlice";
import { fetchUserProfile } from "@/features/userSlice";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { userProfile, loading } = useAppSelector((state) => state.user);
  const { friends } = useAppSelector((state) => state.friends);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (userProfile?.ID) {
      dispatch(getFriends(userProfile.ID));
    } else {
      dispatch(fetchUserProfile());
    }
  }, [userProfile, dispatch]);

  const data = getSidebarData(friends);
  if (!userProfile || loading) {
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <SearchUser />
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchUser />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.username}>
            <SidebarGroupLabel>{item.username}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.username}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      onClick={() => {
                        dispatch(
                          getConversations({
                            userOneUsername: userProfile?.Username,
                            userTwoUsername: item.username,
                          })
                        );
                      }}
                    >
                      <Link to={item.url}>{item.username}</Link>
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
