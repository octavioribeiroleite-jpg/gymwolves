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
    const count = weekCheckins.length;

    return { totalMin, totalCal, count };
  }, [checkins]);

  const formatCal = (cal: number) => (cal >= 1000 ? `${(cal / 1000).toFixed(1)}k` : String(cal));

  // Ring progress (goal: 7 workouts/week)
  const goal = 7;
  const progress = Math.min(stats.count / goal, 1);

  return (
    <div className="rounded-2xl surface-2 border border-subtle p-4 card-shadow">
      <div className="flex items-center justify-between">
        {/* Left: metrics list */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500">
              <Dumbbell className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold leading-none">{stats.count}</span>
              <span className="text-[14px] text-muted-foreground">treinos</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500">
              <Timer className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold leading-none">{stats.totalMin}</span>
              <span className="text-[14px] text-muted-foreground">min</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500">
              <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold leading-none">{formatCal(stats.totalCal)}</span>
              <span className="text-[14px] text-muted-foreground">kcal</span>
            </div>
          </div>
        </div>

        {/* Right: ring progress */}
        <div className="relative flex items-center justify-center w-[100px] h-[100px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            {/* Progress */}
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] font-bold leading-none">{stats.count}/{goal}</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">meta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
