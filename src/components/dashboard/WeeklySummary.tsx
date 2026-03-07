import { useMemo } from "react";
import { Timer, Flame, Dumbbell, Footprints } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";

interface WeeklySummaryProps {
  checkins: any[];
}

const WeeklySummary = ({ checkins }: WeeklySummaryProps) => {
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekCheckins = checkins.filter((c) => {
      const date = parseISO(c.checkin_at);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });

    const totalMin = weekCheckins.reduce((sum, c) => sum + (c.duration_min || 0), 0);
    const totalCal = weekCheckins.reduce((sum, c) => sum + (c.calories || 0), 0);
    const totalSteps = weekCheckins.reduce((sum, c) => sum + (c.steps || 0), 0);
    const count = weekCheckins.length;

    return { totalMin, totalCal, totalSteps, count };
  }, [checkins]);

  const formatCal = (cal: number) => (cal >= 1000 ? `${(cal / 1000).toFixed(1)}k` : String(cal));

  const items = [
    {
      icon: Footprints,
      value: stats.totalSteps > 0 ? stats.totalSteps.toLocaleString("pt-BR") : "—",
      label: "passos",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Timer,
      value: `${stats.totalMin}`,
      label: "min",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Flame,
      value: formatCal(stats.totalCal),
      label: "kcal",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      icon: Dumbbell,
      value: `${stats.count}`,
      label: "treinos",
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="rounded-2xl surface-1 border border-subtle p-4 card-shadow">
      <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Resumo da semana
      </h3>
      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                <Icon className={`h-4 w-4 ${item.color}`} strokeWidth={2.2} />
              </div>
              <span className="text-[16px] font-bold leading-tight">{item.value}</span>
              <span className="text-[13px] text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklySummary;
