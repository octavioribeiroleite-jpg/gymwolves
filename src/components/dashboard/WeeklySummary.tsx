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

      <div className="flex items-center gap-4 mb-4">
        <div className="relative shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle
              cx="36" cy="36" r="28"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="36" cy="36" r="28"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {goalReached ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <>
                <span className="text-sm font-bold leading-none">{stats.count}</span>
                <span className="text-[10px] text-muted-foreground">/{goal}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">
                {stats.count} treino{stats.count !== 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-muted-foreground">esta semana</p>
            </div>
          </div>

          {stats.totalMin > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{stats.totalMin} min</p>
                <p className="text-[11px] text-muted-foreground">tempo total</p>
              </div>
            </div>
          )}

          {stats.totalCal > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{stats.totalCal} kcal</p>
                <p className="text-[11px] text-muted-foreground">queimadas</p>
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
