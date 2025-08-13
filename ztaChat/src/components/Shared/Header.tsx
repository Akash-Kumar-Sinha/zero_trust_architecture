import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "../Sidebar/ModeToggle";
import { Shield, Lock } from "lucide-react";

interface HeaderProps {
  url?: string;
  navTitle?: string;
  title?: string;
  showSecurity?: boolean;
}

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { delay: 0.2, duration: 0.3, ease: "easeOut" },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
} as const;

const Header = ({
  url = "/",
  navTitle = "Home",
  title = "Dashboard",
  showSecurity = true,
}: HeaderProps) => {
  return (
    <motion.header
      className="sticky top-0 z-50 flex justify-between items-center border-b border-[var(--sidebar-border)] px-4 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl shadow-sm"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex h-16 shrink-0 items-center gap-2">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SidebarTrigger className="-ml-1 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors duration-200" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 bg-[var(--sidebar-border)]"
          />
        </motion.div>

        <div className="flex items-center gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href={url}
                    className="text-[var(--sidebar-primary)] hover:text-[var(--sidebar-foreground)] transition-colors duration-200 font-medium"
                  >
                    {navTitle}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </motion.div>
              <BreadcrumbSeparator className="hidden md:block text-[var(--sidebar-primary)]" />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[var(--sidebar-foreground)] font-semibold text-lg">
                    {title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </motion.div>
              <Separator
                orientation="vertical"
                className="mr-2 h-4 bg-[var(--sidebar-border)]"
              />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <BreadcrumbItem className="flex items-center gap-2">
                  {showSecurity && (
                    <motion.div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm"
                      variants={badgeVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      <Shield className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        Encrypted
                      </span>
                      <Lock className="h-2.5 w-2.5 text-green-600" />
                    </motion.div>
                  )}
                </BreadcrumbItem>
              </motion.div>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center"
      >
        <ModeToggle />
      </motion.div>
    </motion.header>
  );
};

export default Header;
