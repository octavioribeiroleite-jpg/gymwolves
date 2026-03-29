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

          <Popover open={goalOpen} onOpenChange={setGoalOpen}>
            <PopoverTrigger asChild>
              <button className="relative flex items-center justify-center w-[76px] h-[76px] shrink-0 group cursor-pointer">
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
                  <Pencil className="h-2.5 w-2.5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
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

        <WeekDots checkins={checkins} />
      </div>
    </div>
  );
};

export default WeeklySummary;
