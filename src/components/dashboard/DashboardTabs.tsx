import { FileText, Trophy, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: "detalhes", icon: FileText, label: "Detalhes" },
  { key: "classificacoes", icon: Trophy, label: "Classificações" },
  { key: "batepapo", icon: MessageCircle, label: "Bate-papo" },
];

const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  return (
    <div className="fixed bottom-[56px] left-0 right-0 z-30 border-t border-subtle bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-md items-center justify-around">
        {tabs.map(({ key, icon: Icon, label }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardTabs;
