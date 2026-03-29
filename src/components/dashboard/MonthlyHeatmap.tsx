import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  getDay,
  isToday,
  subMonths,
  addMonths,
  isFuture,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthlyHeatmapProps {
  checkins: any[];
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

const MonthlyHeatmap = ({ checkins }: MonthlyHeatmapProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { grid, trainedCount, monthLabel } = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const checkinDates = new Set(
      checkins.map((c) => format(parseISO(c.checkin_at), "yyyy-MM-dd"))
    );

    // Build 7-column grid with offset for start day
    const startDow = getDay(start); // 0=Sun
    const cells: (null | { date: Date; key: string; done: boolean; future: boolean; today: boolean })[] = [];

    for (let i = 0; i < startDow; i++) cells.push(null);

    let trained = 0;
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const done = checkinDates.has(key);
      if (done) trained++;
      cells.push({ date: day, key, done, future: isFuture(day), today: isToday(day) });
    }

    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return {
      grid: rows,
      trainedCount: trained,
      monthLabel: format(currentMonth, "MMMM yyyy", { locale: ptBR }),
    };
  }, [checkins, currentMonth]);

  const canGoNext = !isFuture(startOfMonth(addMonths(currentMonth, 1)));

  return (
    <div className="space-y-2">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        Mapa de treinos
      </h2>
      <div className="rounded-2xl surface-2 border border-subtle px-4 py-3 card-shadow">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold capitalize">{monthLabel}</span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            disabled={!canGoNext}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {grid.flat().map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            return (
              <div
                key={cell.key}
                className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200 ${
                  cell.done
                    ? "bg-primary text-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.3)]"
                    : cell.today
                    ? "border border-primary/50 text-foreground"
                    : cell.future
                    ? "text-muted-foreground/30"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                {format(cell.date, "d")}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-subtle">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span className="text-[11px] text-muted-foreground">Treinou</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-muted/40 ml-2" />
            <span className="text-[11px] text-muted-foreground">Não treinou</span>
          </div>
          <span className="text-[12px] font-semibold text-primary">{trainedCount} dias</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyHeatmap;
