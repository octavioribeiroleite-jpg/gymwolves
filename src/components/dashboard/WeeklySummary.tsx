import { useMemo } from "react";
import { Timer, Flame, Dumbbell } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import StatCard from "@/components/ds/StatCard";

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

  return (
    <div className="space-y-2">
      <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
        Resumo da semana
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={Timer} value={`${stats.totalMin}`} label="minutos" />
        <StatCard icon={Flame} value={formatCal(stats.totalCal)} label="calorias" />
        <StatCard icon={Dumbbell} value={stats.count} label="treinos" />
      </div>
    </div>
  );
};

export default WeeklySummary;
