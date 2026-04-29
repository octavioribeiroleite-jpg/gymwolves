import { useMemo, useState } from "react";
import { Flame, Dumbbell, Pencil, CheckCircle2 } from "lucide-react";
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
    const seenDates = new Set();
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
  const circumference = 2 * Math.PI * 20;
  const goalReached = stats.count >= goal;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base text-foreground">Sua semana</h3>
        <Popover open={goalOpen} onOpenChange={setGoalOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-2.5 py-1 rounded-full">
              <span>Meta: {stats.count}/{goal}</span>
              <Pencil className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Meta semanal</p>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <Button
                  key={n}
                  variant={goal === n ? "default" : "ghost"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => { onGoalChange?.(n); setGoalOpen(false); }}
                >
                  {n}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {/* Anel menor (52px) */}
        <div className="relative shrink-0">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle
              cx="26" cy="26" r="20"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="5"
            />
            <circle
              cx="26" cy="26" r="20"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 26 26)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {goalReached ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <span className="text-[11px] font-bold leading-none">
                {stats.count}<span className="text-muted-foreground font-medium">/{goal}</span>
              </span>
            )}
          </div>
        </div>

        {/* Stats em linha horizontal */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="flex flex-1 items-center gap-1.5 rounded-xl bg-primary/5 px-2 py-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Dumbbell className="w-3 h-3 text-primary" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[12px] font-bold truncate">{stats.count}</span>
              <span className="text-[9px] text-muted-foreground truncate">treinos</span>
            </div>
          </div>

          {stats.totalMin > 0 && (
            <div className="flex flex-1 items-center gap-1.5 rounded-xl bg-blue-500/5 px-2 py-1.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                <svg
                  className="w-3 h-3 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[12px] font-bold truncate">{stats.totalMin}</span>
                <span className="text-[9px] text-muted-foreground truncate">min</span>
              </div>
            </div>
          )}

          {stats.totalCal > 0 && (
            <div className="flex flex-1 items-center gap-1.5 rounded-xl bg-orange-500/5 px-2 py-1.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                <Flame className="w-3 h-3 text-orange-500" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[12px] font-bold truncate">{stats.totalCal}</span>
                <span className="text-[9px] text-muted-foreground truncate">kcal</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <WeekDots checkins={checkins} />
    </div>
  );
};

export default WeeklySummary;
