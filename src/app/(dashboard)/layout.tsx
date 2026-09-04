import { DemoDataBootstrap } from "@/components/layout/DemoDataBootstrap";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileTopbar } from "@/components/layout/MobileTopbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DemoDataBootstrap />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar />
        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
