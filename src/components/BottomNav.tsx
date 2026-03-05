import { Home, Calendar, Trophy, User, Swords } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/desafios", icon: Swords, label: "Desafios" },
  { to: "/historico", icon: Calendar, label: "Histórico" },
  { to: "/ranking", icon: Trophy, label: "Ranking" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-md items-center justify-around pb-[env(safe-area-inset-bottom)] pt-1">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] transition-all duration-200",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                active && "bg-primary/15"
              )}>
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_hsl(142_71%_45%/0.5)]")} />
              </div>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
