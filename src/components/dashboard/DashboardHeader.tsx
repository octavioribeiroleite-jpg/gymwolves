import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
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
      <div className="mx-auto flex h-12 max-w-md items-center justify-between px-5">
        <SidebarMenu />
        <div className="flex-1 text-center min-w-0 px-2">
          <h1 className="text-[14px] font-bold truncate leading-tight">
            {greeting}, {firstName} {streak >= 5 ? "🔥" : streak >= 3 ? "💪" : todayDone ? "✅" : "👋"}
          </h1>
          {activeGroupName && (
            <p className="text-[10px] text-muted-foreground truncate leading-tight">
              {activeGroupName}
            </p>
          )}
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4.5 w-4.5" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
