import { SidebarInset, SidebarProvider } from "./ui/sidebar";

import { AppSidebar } from "./Sidebar/AppSidebar";
import { Outlet } from "react-router";

const RootApp = () => {
  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
};

export default RootApp;
