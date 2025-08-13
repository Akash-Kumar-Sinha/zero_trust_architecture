import { motion } from "framer-motion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <motion.div
          className="p-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <SidebarTrigger className="bg-sidebar/80 hover:bg-sidebar-accent/60 border border-sidebar-border/50 rounded-lg backdrop-blur-sm transition-all duration-300 hover:shadow-md" />
        </motion.div>
        <div className="h-full overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
