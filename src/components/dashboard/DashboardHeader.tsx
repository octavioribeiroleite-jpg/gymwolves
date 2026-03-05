import { Bell, MoreVertical } from "lucide-react";
import SidebarMenu from "@/components/SidebarMenu";

interface DashboardHeaderProps {
  groupName: string;
}

const DashboardHeader = ({ groupName }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <SidebarMenu />
        <h1 className="text-[15px] font-bold truncate max-w-[200px]">{groupName}</h1>
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
