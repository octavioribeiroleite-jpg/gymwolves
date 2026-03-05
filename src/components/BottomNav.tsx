import { Home, Swords, Calendar, Trophy, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNavContext } from "@/hooks/useNavContext";

const BottomNav = () => {
  const { pathname } = useLocation();
  const { todayDone, groupCount, monthDays, rankPosition } = useNavContext();

  const items = [
    {
      to: "/",
      icon: Home,
      label: "Início",
      badge: todayDone !== null ? (todayDone ? "done" : "pending") : null,
      activeLabel: todayDone ? "Feito ✓" : "Pendente",
    },
    {
      to: "/grupos",
      icon: Swords,
      label: "Grupos",
      badge: groupCount && groupCount > 0 ? String(groupCount) : null,
      activeLabel: groupCount ? `${groupCount} grupo${groupCount > 1 ? "s" : ""}` : "Grupos",
    },
    {
      to: "/historico",
      icon: Calendar,
      label: "Histórico",
      badge: monthDays && monthDays > 0 ? String(monthDays) : null,
      activeLabel: monthDays ? `${monthDays} dias` : "Histórico",
    },
    {
      to: "/ranking",
      icon: Trophy,
      label: "Ranking",
      badge: rankPosition ? `#${rankPosition}` : null,
      activeLabel: rankPosition ? `${rankPosition}º lugar` : "Ranking",
    },
    {
      to: "/perfil",
      icon: User,
      label: "Perfil",
      badge: null,
      activeLabel: "Perfil",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-subtle bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around pb-[env(safe-area-inset-bottom)] pt-1">
        {items.map(({ to, icon: Icon, label, badge, activeLabel }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] transition-all duration-200",
                active ? "text-primary" : "text-tertiary-alpha hover:text-foreground"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                  active && "bg-primary/15"
                )}>
                  <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.2 : 1.8} />
                </div>
                {/* Badge */}
                {badge && (
                  badge === "done" ? (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                  ) : badge === "pending" ? (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background" />
                  ) : (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                      {badge}
                    </span>
                  )
                )}
              </div>
              <span className="font-medium">
                {active ? activeLabel : label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
