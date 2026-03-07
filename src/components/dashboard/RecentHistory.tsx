import { useMemo, useState } from "react";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dumbbell, Footprints, Bike, Heart, Zap, ChevronRight, Timer, Flame, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

const workoutLabels: Record<string, string> = {
  musculacao: "Musculação",
  corrida: "Corrida",
  caminhada: "Caminhada",
  ciclismo: "Ciclismo",
  cardio: "Cardio",
};

const RecentHistory = ({ checkins }: RecentHistoryProps) => {
  const [selectedCheckin, setSelectedCheckin] = useState<any>(null);

  const recent = useMemo(() => {
    return [...checkins]
      .sort((a, b) => new Date(b.checkin_at).getTime() - new Date(a.checkin_at).getTime())
      .slice(0, 5);
  }, [checkins]);

  if (recent.length === 0) return null;

  const formatDuration = (min: number) => {
    if (!min) return "—";
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:00`;
    return `${m}min`;
  };

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
          Histórico recente
        </h3>
        <div className="space-y-1.5">
          {recent.map((c) => {
            const Icon = workoutIcons[c.workout_type] || Zap;
            const meta: string[] = [];
            if (c.duration_min) meta.push(`${c.duration_min}min`);
            if (c.calories) meta.push(`${c.calories} kcal`);

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCheckin(c)}
                className="flex w-full items-center gap-2.5 rounded-xl surface-1 border border-subtle px-3 py-2.5 card-shadow text-left transition-default hover:border-primary/20 active:scale-[0.98]"
              >
                {c.proof_url ? (
                  <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-secondary">
                    <img src={c.proof_url} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
                  </div>
                )}
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
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Sheet - Samsung Health style */}
      <Sheet open={!!selectedCheckin} onOpenChange={(open) => !open && setSelectedCheckin(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
          {selectedCheckin && (() => {
            const c = selectedCheckin;
            const Icon = workoutIcons[c.workout_type] || Zap;
            const typeLabel = workoutLabels[c.workout_type] || c.workout_type || "Treino";

            return (
              <>
                {/* Header with gradient */}
                <div className="gradient-primary px-5 pt-4 pb-5 -mt-6 rounded-t-3xl">
                  <SheetHeader className="mb-3">
                    <SheetTitle className="text-primary-foreground text-left text-[15px]">
                      Detalhes do exercício
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[28px] font-bold text-primary-foreground leading-none">
                        {formatDuration(c.duration_min)}
                      </p>
                      <p className="text-[13px] text-primary-foreground/70 mt-1">{typeLabel}</p>
                    </div>
                    {c.calories > 0 && (
                      <div className="flex items-center gap-1.5 bg-primary-foreground/20 rounded-full px-3 py-1.5">
                        <Flame className="h-4 w-4 text-primary-foreground" />
                        <span className="text-[14px] font-bold text-primary-foreground">
                          {c.calories} kcal
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proof photo */}
                {c.proof_url && (
                  <div className="px-5 pt-4">
                    <div className="rounded-2xl overflow-hidden bg-secondary">
                      <img src={c.proof_url} alt="Treino" className="w-full max-h-[50vh] object-contain" />
                    </div>
                  </div>
                )}

                {/* Details grid */}
                <div className="px-5 pt-5">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      icon={Timer}
                      label="Duração total"
                      value={formatDuration(c.duration_min)}
                      color="text-blue-500"
                    />
                    <DetailItem
                      icon={Flame}
                      label="Calorias perdidas"
                      value={c.calories ? `${c.calories} kcal` : "—"}
                      color="text-rose-500"
                    />
                    {c.distance_km && (
                      <DetailItem
                        icon={Footprints}
                        label="Distância"
                        value={`${c.distance_km} km`}
                        color="text-emerald-500"
                      />
                    )}
                    {c.steps && (
                      <DetailItem
                        icon={Footprints}
                        label="Passos"
                        value={c.steps.toLocaleString("pt-BR")}
                        color="text-emerald-500"
                      />
                    )}
                  </div>

                  {c.note && (
                    <div className="mt-4 rounded-xl bg-muted p-3">
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Nota</p>
                      <p className="text-[13px]">{c.note}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground text-center mt-5">
                    {format(parseISO(c.checkin_at), "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
};

interface DetailItemProps {
  icon: any;
  label: string;
  value: string;
  color: string;
}

const DetailItem = ({ icon: Icon, label, value, color }: DetailItemProps) => (
  <div className="space-y-1">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <div className="flex items-center gap-1.5">
      <Icon className={`h-4 w-4 ${color}`} strokeWidth={2} />
      <span className={`text-[17px] font-bold ${color}`}>{value}</span>
    </div>
  </div>
);

export default RecentHistory;
