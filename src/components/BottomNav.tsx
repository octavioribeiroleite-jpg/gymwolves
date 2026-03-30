import { Home, Swords, Trophy, User, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNavContext } from "@/hooks/useNavContext";

interface BottomNavProps {
  onCheckin?: () => void;
}

const BottomNav = ({ onCheckin }: BottomNavProps) => {
  const { pathname } = useLocation();
  const { todayDone, groupCount, rankPosition } = useNavContext();

  const leftItems = [
    {
      to: "/",
      icon: Home,
      label: "Início",
      badge: todayDone !== null ? (todayDone ? "done" : "pending") : null,
    },
    {
      to: "/grupos",
      icon: Swords,
      label: "Grupos",
      badge: groupCount && groupCount > 0 ? String(groupCount) : null,
    },
  ];

  const rightItems = [
    {
      to: "/ranking",
      icon: Trophy,
      label: "Ranking",
      badge: rankPosition ? `#${rankPosition}` : null,
    },
    {
      to: "/perfil",
      icon: User,
      label: "Perfil",
      badge: null,
    },
  ];

  const renderItem = ({ to, icon: Icon, label, badge }: (typeof leftItems)[0]) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        key={to}
        to={to}
        className={cn(
          "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] transition-all duration-200 relative flex-1",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="relative">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200",
              active && "bg-primary/12"
            )}
          >
            <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.3 : 1.7} />
          </div>
          {badge &&
            (badge === "done" ? (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            ) : badge === "pending" ? (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-background" />
            ) : (
              <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground ring-2 ring-background">
                {badge}
              </span>
            ))}
        </div>
        <span className="font-medium leading-tight">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-md items-center justify-around pb-[env(safe-area-inset-bottom)] h-16">
        {leftItems.map(renderItem)}

        {/* Center check-in button */}
        <div className="flex flex-col items-center gap-0.5 px-2 relative -mt-5">
          <button
            onClick={onCheckin}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-primary transition-all active:scale-90 ring-4 ring-background"
            aria-label="Registrar treino"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>

        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
};

export default BottomNav;
