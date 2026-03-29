import { Bell, MoreVertical } from "lucide-react";
import SidebarMenu from "@/components/SidebarMenu";

interface DashboardHeaderProps {
  userName: string;
  streak?: number;
  todayDone?: boolean;
}

const getGreeting = (name: string, streak: number, todayDone: boolean) => {
  const hour = new Date().getHours();
  let timeGreeting = "Olá";
  if (hour < 12) timeGreeting = "Bom dia";
  else if (hour < 18) timeGreeting = "Boa tarde";
  else timeGreeting = "Boa noite";

  if (streak >= 5) return `${timeGreeting}, ${name}! 🔥 ${streak} dias seguidos!`;
  if (streak >= 3) return `${timeGreeting}, ${name}! 💪 Sequência de ${streak}!`;
  if (!todayDone) return `${timeGreeting}, ${name}! Bora treinar? 🏋️`;
  return `${timeGreeting}, ${name}! ✅`;
};

const DashboardHeader = ({ userName, streak = 0, todayDone = false }: DashboardHeaderProps) => {
  const firstName = userName.split(" ")[0];
  const greeting = getGreeting(firstName, streak, todayDone);

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <SidebarMenu />
        <h1 className="text-[14px] font-bold truncate max-w-[220px] text-center">
          {greeting}
        </h1>
        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
