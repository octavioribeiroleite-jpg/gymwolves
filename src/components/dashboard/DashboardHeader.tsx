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

const getEmoji = (streak: number, todayDone: boolean) => {
  if (streak >= 7) return "🔥";
  if (streak >= 3) return "💪";
  if (todayDone) return "✅";
  return "👋";
};

const DashboardHeader = ({ userName, streak = 0, todayDone = false, activeGroupName }: DashboardHeaderProps) => {
  const firstName = userName.split(" ")[0];
  const greeting = getGreeting();
  const emoji = getEmoji(streak, todayDone);

  return (
    <div className="flex items-center justify-between px-1 py-2">
      {/* Left: menu */}
      <SidebarMenu />

      {/* Center: greeting */}
      <div className="flex flex-col items-center flex-1 min-w-0 px-2">
        <h1 className="text-base font-bold text-foreground truncate">
          {greeting}, {firstName} {emoji}
        </h1>
        {activeGroupName && (
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{activeGroupName}</p>
        )}
      </div>

      {/* Right: bell */}
      <Link to="/notificacoes" className="relative p-2 rounded-full hover:bg-muted transition-colors shrink-0">
        <Bell className="w-5 h-5 text-muted-foreground" />
      </Link>
    </div>
  );
};

export default DashboardHeader;
