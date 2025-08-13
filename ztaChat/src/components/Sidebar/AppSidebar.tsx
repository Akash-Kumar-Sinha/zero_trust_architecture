import * as React from "react";
import { useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
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

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const groupVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
  };

  if (!userProfile || loading) {
    return (
      <Sidebar
        {...props}
        className="bg-sidebar border-r border-sidebar-border backdrop-blur-sm"
      >
        <SidebarHeader className="p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SearchUser />
          </motion.div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <motion.div variants={sidebarVariants} initial="hidden" animate="visible">
      <Sidebar
        {...props}
        className="bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 shadow-lg"
      >
        <SidebarHeader className="p-4 border-b border-sidebar-border/30">
          <motion.div variants={itemVariants}>
            <SearchUser />
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <AnimatePresence mode="wait">
            {data.navMain.map((item, groupIndex) => (
              <motion.div
                key={item.username}
                variants={groupVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: groupIndex * 0.1 }}
              >
                <SidebarGroup className="mb-4">
                  <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold text-xs uppercase tracking-wider px-3 py-2">
                    {item.username}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {item.items.map((chatItem, itemIndex) => (
                        <motion.div
                          key={chatItem.username}
                          variants={itemVariants}
                          transition={{ delay: itemIndex * 0.05 }}
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === chatItem.url}
                              className="group relative overflow-hidden rounded-lg mx-1 transition-all duration-300 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:shadow-md hover:scale-[1.02]"
                              onClick={() => {
                                dispatch(
                                  getConversations({
                                    userOneUsername: userProfile?.Username,
                                    userTwoUsername: chatItem.username,
                                  })
                                );
                              }}
                            >
                              <Link
                                to={chatItem.url}
                                className="flex items-center gap-3 p-3 w-full"
                              >
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-primary/60"
                                  animate={{
                                    scale:
                                      location.pathname === chatItem.url
                                        ? [1, 1.2, 1]
                                        : 1,
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat:
                                      location.pathname === chatItem.url
                                        ? Infinity
                                        : 0,
                                  }}
                                />
                                <span className="font-medium truncate">
                                  {chatItem.username}
                                </span>
                                <motion.div
                                  className="ml-auto w-1 h-4 bg-sidebar-primary rounded-full opacity-0 group-hover:opacity-100"
                                  layoutId={`active-${chatItem.username}`}
                                  transition={{ duration: 0.2 }}
                                />
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </motion.div>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </motion.div>
            ))}
          </AnimatePresence>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border/30 bg-sidebar-accent/20">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {!userProfile ? (
              <div className="flex items-center gap-2 w-full p-2">
                <Skeleton className="h-6 w-6 rounded-lg bg-sidebar-accent/30" />
                <Skeleton className="h-6 w-full bg-sidebar-accent/30" />
              </div>
            ) : (
              <NavUser user={userProfile} />
            )}
          </motion.div>
        </SidebarFooter>

        <SidebarRail className="bg-sidebar-border/50" />
      </Sidebar>
    </motion.div>
  );
}
