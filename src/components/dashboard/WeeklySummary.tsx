import { useMemo } from "react";
import { Timer, Flame, Dumbbell } from "lucide-react";
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
    const count = weekCheckins.length;

    return { totalMin, totalCal, count };
  }, [checkins]);

  const goal = 7;
  const progress = Math.min(stats.count / goal, 1);
  const circumference = 2 * Math.PI * 34;

  return (
    <div className="space-y-2">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Resumo semanal</h2>
      <div className="rounded-2xl surface-2 border border-subtle px-4 py-3 card-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
              <Dumbbell className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-bold leading-none">{stats.count}</span>
            <span className="text-[12px] text-muted-foreground -ml-1">treinos</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500">
              <Timer className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-bold leading-none">{stats.totalMin}</span>
            <span className="text-[12px] text-muted-foreground -ml-1">min</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500">
              <Flame className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-bold leading-none">{stats.totalCal}</span>
            <span className="text-[12px] text-muted-foreground -ml-1">kcal</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-[76px] h-[76px] shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - progress)}`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[14px] font-bold leading-none">{stats.count}/{goal}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default WeeklySummary;
