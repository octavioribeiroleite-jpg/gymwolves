import { Bell } from "lucide-react";
import SidebarMenu from "@/components/SidebarMenu";

interface DashboardHeaderProps {
  userName: string;
  streak?: number;
  todayDone?: boolean;
  activeGroupName?: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const DashboardHeader = ({ userName, streak = 0, todayDone = false, activeGroupName }: DashboardHeaderProps) => {
  const firstName = userName.split(" ")[0];
  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <SidebarMenu />
        <div className="flex-1 text-center min-w-0 px-2">
          <h1 className="text-[15px] font-bold truncate">
            {greeting}, {firstName} {streak >= 5 ? "🔥" : streak >= 3 ? "💪" : todayDone ? "✅" : "👋"}
          </h1>
          {activeGroupName && (
            <p className="text-[11px] text-muted-foreground truncate -mt-0.5">
              {activeGroupName}
            </p>
          )}
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
