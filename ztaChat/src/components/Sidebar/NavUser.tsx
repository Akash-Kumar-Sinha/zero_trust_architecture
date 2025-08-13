import { BadgeCheck, ChevronsUpDown, LogOut, UserPlus2 } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type Profile } from "@/utils/type";
import { NavLink, useNavigate } from "react-router";
import { useAppDispatch } from "@/utils/Hooks/redux";
import { logoutUser } from "@/features/userSlice";

export const NavUser = ({ user }: { user: Profile }) => {
  const { isMobile } = useSidebar();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser(navigate));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/70 transition-all duration-300 rounded-xl shadow-sm border border-sidebar-border/20 bg-sidebar/50 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Avatar className="h-8 w-8 rounded-lg border-2 border-sidebar-primary/20">
                    <AvatarImage src={user.ProfileImage} alt={user.Username} />
                    <AvatarFallback className="rounded-lg bg-sidebar-primary/10 text-sidebar-primary font-semibold">
                      {user.Username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <motion.span
                    className="truncate font-semibold text-sidebar-foreground"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {user.Username}
                  </motion.span>
                  <motion.span
                    className="truncate text-xs text-sidebar-foreground/60"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {user.PublicKey?.slice(0, 20)}...
                  </motion.span>
                </div>
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/70" />
                </motion.div>
              </SidebarMenuButton>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-sidebar-border/50 bg-sidebar/90 backdrop-blur-xl shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <motion.div
                className="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Avatar className="h-8 w-8 rounded-lg border-2 border-sidebar-primary/20">
                  <AvatarImage src={user.ProfileImage} alt={user.Username} />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary/10 text-sidebar-primary font-semibold">
                    {user.Username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {user.Username}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {user.Username}
                  </span>
                </div>
              </motion.div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sidebar-border/50" />

            <DropdownMenuGroup>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DropdownMenuItem className="hover:bg-sidebar-accent/60 focus:bg-sidebar-accent/60 rounded-lg mx-1 transition-colors duration-200">
                  <BadgeCheck className="text-sidebar-primary" />
                  <span className="text-sidebar-foreground">Account</span>
                </DropdownMenuItem>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <DropdownMenuItem className="hover:bg-sidebar-accent/60 focus:bg-sidebar-accent/60 rounded-lg mx-1 transition-colors duration-200 p-0">
                  <NavLink
                    to="/friend_requests"
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  >
                    <UserPlus2 className="text-sidebar-primary" />
                    FriendRequests
                  </NavLink>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-sidebar-border/50" />
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:bg-destructive/10 focus:bg-destructive/10 text-destructive hover:text-destructive rounded-lg mx-1 transition-colors duration-200"
              >
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
