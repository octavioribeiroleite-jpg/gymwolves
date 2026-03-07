import { useMemo } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dumbbell, Footprints, Bike, Heart, Zap } from "lucide-react";

interface RecentHistoryProps {
  checkins: any[];
}

const workoutIcons: Record<string, any> = {
  musculacao: Dumbbell,
  corrida: Footprints,
  caminhada: Footprints,
  ciclismo: Bike,
  cardio: Heart,
};

const RecentHistory = ({ checkins }: RecentHistoryProps) => {
  const recent = useMemo(() => {
    return [...checkins]
      .sort((a, b) => new Date(b.checkin_at).getTime() - new Date(a.checkin_at).getTime())
      .slice(0, 5);
  }, [checkins]);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
        Histórico recente
      </h3>
      <div className="space-y-2">
        {recent.map((c) => {
          const Icon = workoutIcons[c.workout_type] || Zap;
          const meta: string[] = [];
          if (c.duration_min) meta.push(`${c.duration_min}min`);
          if (c.calories) meta.push(`${c.calories} cal`);

          return (
            <div
              key={c.id}
              className="flex items-center gap-2.5 rounded-xl surface-1 border border-subtle px-3 py-2 card-shadow"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate leading-tight">{c.title || "Treino"}</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {meta.length > 0 ? meta.join(" · ") + " · " : ""}
                  {formatDistanceToNow(parseISO(c.checkin_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentHistory;
