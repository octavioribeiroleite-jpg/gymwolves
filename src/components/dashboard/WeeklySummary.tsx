import { useMemo, useState } from "react";
import { Timer, Flame, Dumbbell, Pencil } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format } from "date-fns";
import WeekDots from "./WeekDots";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface WeeklySummaryProps {
  checkins: any[];
  weeklyGoal: number;
  onGoalChange?: (goal: number) => void;
}

const WeeklySummary = ({ checkins, weeklyGoal, onGoalChange }: WeeklySummaryProps) => {
  const [goalOpen, setGoalOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekCheckins = checkins.filter((c) => {
      const date = parseISO(c.checkin_at);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });

    const seenDates = new Set<string>();
    const uniqueCheckins = weekCheckins.filter((c) => {
      const day = format(parseISO(c.checkin_at), "yyyy-MM-dd");
      if (seenDates.has(day)) return false;
      seenDates.add(day);
      return true;
    });

    const totalMin = uniqueCheckins.reduce((sum, c) => sum + (c.duration_min || 0), 0);
    const totalCal = uniqueCheckins.reduce((sum, c) => sum + (c.calories || 0), 0);
    const count = uniqueCheckins.length;

    return { totalMin, totalCal, count };
  }, [checkins]);

  const goal = weeklyGoal;
  const progress = Math.min(stats.count / goal, 1);
  const circumference = 2 * Math.PI * 28;

  return (
    <div className="rounded-2xl surface-1 border border-subtle p-3 card-shadow">
      {/* Title row */}
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[13px] font-bold">Sua semana</h2>
        <Popover open={goalOpen} onOpenChange={setGoalOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              Meta: {stats.count}/{goal}
              <Pencil className="h-2.5 w-2.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <p className="text-xs text-muted-foreground mb-2">Meta semanal</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={n === goal ? "default" : "outline"}
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => {
                    onGoalChange?.(n);
                    setGoalOpen(false);
                  }}
                >
                  {n}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Progress ring + metrics */}
      <div className="flex items-center gap-2.5">
        {/* Ring */}
        <div className="relative flex items-center justify-center w-[44px] h-[44px] shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - progress)}`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-[10px] font-bold">{stats.count}/{goal}</span>
        </div>

        {/* Metrics in a row */}
        <div className="flex-1 flex items-center gap-2.5">
          <MetricPill icon={Dumbbell} value={stats.count} label="treinos" color="bg-primary" />
          {stats.totalMin > 0 && (
            <MetricPill icon={Timer} value={stats.totalMin} label="min" color="bg-blue-500" />
          )}
          {stats.totalCal > 0 && (
            <MetricPill icon={Flame} value={stats.totalCal} label="kcal" color="bg-rose-500" />
          )}
        </div>
      </div>

      {/* Week dots */}
      <WeekDots checkins={checkins} />
    </div>
  );
};

const MetricPill = ({ icon: Icon, value, label, color }: { icon: any; value: number; label: string; color: string }) => (
  <div className="flex flex-col items-center">
    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${color} mb-0.5`}>
      <Icon className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
    </div>
    <span className="text-[13px] font-bold leading-none">{value}</span>
    <span className="text-[9px] text-muted-foreground">{label}</span>
  </div>
);

export default WeeklySummary;
