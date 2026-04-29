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
import { ChevronLeft, ChevronRight, X, Dumbbell, CalendarDays } from "lucide-react";
import { getPublicImageUrl, getThumbnailUrl } from "@/lib/storage";
import { useNavigate } from "react-router-dom";

interface MonthlyHeatmapProps {
  checkins: any[];
  compact?: boolean;
}

interface DayCheckin {
  id: string;
  title: string;
  workout_type: string;
  duration_min?: number | null;
  calories?: number | null;
  proof_url?: string | null;
  note?: string | null;
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

const PhotoThumbnail = ({ proofUrl }: { proofUrl: string }) => {
  const url = getPublicImageUrl(proofUrl);
  if (!url) return null;

  return (
    <>
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center rounded-md z-0 opacity-0 transition-opacity duration-300"
        onLoad={(e) => { (e.target as HTMLImageElement).classList.replace("opacity-0", "opacity-100"); }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {/* Gradient inferior para legibilidade do número */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-[1] rounded-b-md bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
    </>
  );
};

const DayDetailSheet = ({
  dateKey,
  dayCheckins,
  onClose,
}: {
  dateKey: string;
  dayCheckins: DayCheckin[];
  onClose: () => void;
}) => {
  const signedUrls = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of dayCheckins) {
      if (c.proof_url) {
        const url = getPublicImageUrl(c.proof_url);
        if (url) map[c.proof_url] = url;
      }
    }
    return map;
  }, [dayCheckins]);

  const dateFormatted = format(parseISO(dateKey), "dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold capitalize">{dateFormatted}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/50">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          {dayCheckins.map((c) => (
            <div key={c.id} className="rounded-2xl surface-1 border border-subtle overflow-hidden">
              {c.proof_url && signedUrls[c.proof_url] && (
                <img
                  src={signedUrls[c.proof_url]}
                  alt="Treino"
                  loading="lazy"
                  decoding="async"
                  className="w-full max-h-[50vh] object-contain bg-black/5 opacity-0 transition-opacity duration-300"
                  onLoad={(e) => { (e.target as HTMLImageElement).classList.replace("opacity-0", "opacity-100"); }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{c.title}</span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {c.duration_min && <span>⏱ {c.duration_min}min</span>}
                  {c.calories && <span>🔥 {c.calories} kcal</span>}
                </div>
                {c.note && (
                  <p className="text-xs text-muted-foreground mt-1">{c.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonthlyHeatmap = ({ checkins, compact = false }: MonthlyHeatmapProps) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!compact);

  const checkinsByDate = useMemo(() => {
    const map: Record<string, DayCheckin[]> = {};
    for (const c of checkins) {
      const key = format(parseISO(c.checkin_at), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push({
        id: c.id,
        title: c.title || "Treino",
        workout_type: c.workout_type || "musculacao",
        duration_min: c.duration_min,
        calories: c.calories,
        proof_url: c.proof_url,
        note: c.note,
      });
    }
    return map;
  }, [checkins]);

  const { grid, trainedCount, monthLabel } = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const startDow = getDay(start);
    const cells: (null | {
      date: Date;
      key: string;
      done: boolean;
      future: boolean;
      today: boolean;
      hasPhoto: boolean;
      firstPhoto: string | null;
    })[] = [];

    for (let i = 0; i < startDow; i++) cells.push(null);

    let trained = 0;
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const dayCheckins = checkinsByDate[key] || [];
      const done = dayCheckins.length > 0;
      if (done) trained++;
      const firstPhoto = dayCheckins.find((c) => c.proof_url)?.proof_url || null;
      cells.push({
        date: day,
        key,
        done,
        future: isFuture(day),
        today: isToday(day),
        hasPhoto: !!firstPhoto,
        firstPhoto,
      });
    }

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
  }, [checkins, currentMonth, checkinsByDate]);

  const canGoNext = !isFuture(startOfMonth(addMonths(currentMonth, 1)));

  // Compact: show summary only
  if (compact && !expanded) {
    return (
      <div className="rounded-2xl surface-1 border border-subtle p-4 card-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="text-[14px] font-bold">Mapa de treinos</h2>
          </div>
          <span className="text-[13px] font-bold text-primary">{trainedCount} dias</span>
        </div>
        <p className="text-[12px] text-muted-foreground mt-1 capitalize">{monthLabel}</p>
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center gap-1 w-full mt-3 pt-2.5 border-t border-subtle text-[13px] font-medium text-primary"
        >
          Abrir calendário
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold">Mapa de treinos</h2>
        {compact && expanded && (
          <button onClick={() => setExpanded(false)} className="text-[12px] text-muted-foreground">
            Recolher
          </button>
        )}
      </div>
      <div className="rounded-2xl surface-1 border border-subtle px-3 py-3 card-shadow">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-[13px] font-semibold capitalize">{monthLabel}</span>
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
        <div className="grid grid-cols-7 gap-1.5">
          {grid.flat().map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const hasPhoto = cell.done && cell.hasPhoto && !!cell.firstPhoto;

            return (
              <button
                key={cell.key}
                disabled={!cell.done}
                onClick={() => cell.done && setSelectedDay(cell.key)}
                className={`relative aspect-square rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-200 overflow-hidden isolate ${
                  cell.done
                    ? "bg-primary text-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.3)] cursor-pointer active:scale-95"
                    : cell.today
                    ? "border border-primary/50 text-foreground cursor-default"
                    : cell.future
                    ? "text-muted-foreground/30 cursor-default"
                    : "bg-muted/40 text-muted-foreground cursor-default"
                }`}
              >
                {hasPhoto && <PhotoThumbnail proofUrl={cell.firstPhoto!} />}

                {hasPhoto ? (
                  <span className="absolute bottom-0.5 left-1 z-10 text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none">
                    {format(cell.date, "d")}
                  </span>
                ) : (
                  <span className="relative z-10 pointer-events-none">
                    {format(cell.date, "d")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-subtle">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span className="text-[11px] text-muted-foreground">Treinou</span>
          </div>
          <span className="text-[12px] font-semibold text-primary">{trainedCount} dias</span>
        </div>
      </div>

      {selectedDay && checkinsByDate[selectedDay] && (
        <DayDetailSheet
          dateKey={selectedDay}
          dayCheckins={checkinsByDate[selectedDay]}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};

export default MonthlyHeatmap;
