import { SidebarProvider } from "@/src/components/layout/Sidebar/SidebarContext";

import Sidebar from "@/src/components/layout/Sidebar/Sidebar";
import Header from "@/src/components/layout/Header/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">

        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

      </div>
    </SidebarProvider>
  );
}