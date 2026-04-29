import { useMemo, useState } from "react";
import { Timer, Flame, Dumbbell, Pencil, Check } from "lucide-react";
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

    // Deduplicate by yyyy-MM-dd to avoid multi-group inflation
    const seenDates = new Set<string>();
    const uniqueCheckins = weekCheckins.filter((c) => {
      const day = format(parseISO(c.checkin_at), "yyyy-MM-dd");
      if (seenDates.has(day)) return false;
      seenDates.add(day);
      return true;
    });

    const totalMin = Math.round(
      uniqueCheckins.reduce((sum, c) => sum + (c.duration_min || 0), 0)
    );
    const totalCal = Math.round(
      uniqueCheckins.reduce((sum, c) => sum + (c.calories || 0), 0)
    );
    const count = uniqueCheckins.length;

    return { totalMin, totalCal, count };
  }, [checkins]);

  const goal = weeklyGoal;
  const progress = Math.min(stats.count / goal, 1);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const goalReached = stats.count >= goal;

  return (
    <div className="rounded-2xl bg-card border border-subtle p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Sua semana</h2>
        <Popover open={goalOpen} onOpenChange={setGoalOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
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

      {/* Main: ring + stats */}
      <div className="flex items-center gap-4">
        {/* Progress ring */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            {goalReached ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
              </div>
            ) : (
              <>
                <span className="text-sm font-bold leading-none">{stats.count}</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  /{goal}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-1 items-stretch gap-2">
          <StatCard
            icon={Dumbbell}
            value={stats.count}
            label={`treino${stats.count !== 1 ? "s" : ""}`}
            iconBg="bg-primary"
          />
          {stats.totalMin > 0 && (
            <StatCard
              icon={Timer}
              value={stats.totalMin}
              label="min"
              iconBg="bg-blue-500"
            />
          )}
          {stats.totalCal > 0 && (
            <StatCard
              icon={Flame}
              value={stats.totalCal}
              label="kcal"
              iconBg="bg-orange-500"
            />
          )}
        </div>
      </div>

      {/* Week dots */}
      <div className="mt-3">
        <WeekDots checkins={checkins} />
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  value,
  label,
  iconBg,
}: {
  icon: any;
  value: number;
  label: string;
  iconBg: string;
}) => (
  <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/50 px-2.5 py-1.5">
    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
      <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
    </div>
    <div className="flex flex-col leading-tight min-w-0">
      <span className="text-[13px] font-bold truncate">{value}</span>
      <span className="text-[10px] text-muted-foreground truncate">{label}</span>
    </div>
  </div>
);

export default WeeklySummary;
