import { useMemo } from "react";
import { startOfWeek, addDays, format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeekDotsProps {
  checkins: any[];
}

const WeekDots = ({ checkins }: WeekDotsProps) => {
  const days = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    const checkinDates = new Set(
      checkins.map((c) => format(parseISO(c.checkin_at), "yyyy-MM-dd"))
    );

    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const key = format(day, "yyyy-MM-dd");
      const label = format(day, "EEEEE", { locale: ptBR }).toUpperCase();
      const done = checkinDates.has(key);
      const isFuture = isAfter(day, now);
      return { key, label, done, isFuture };
    });
  }, [checkins]);

  return (
    <div className="flex items-center justify-between px-1 mt-3">
      {days.map((d) => (
        <div key={d.key} className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
          <div
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              d.done
                ? "bg-primary scale-110 shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
                : d.isFuture
                ? "bg-muted/30"
                : "bg-muted"
            }`}
          />
        </div>
      ))}
    </div>
  );
};

export default WeekDots;
