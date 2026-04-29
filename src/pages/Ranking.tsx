import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Trophy, Flame, Loader2, CalendarDays } from "lucide-react";
import AppScaffold from "@/components/ds/AppScaffold";
import EmptyState from "@/components/ds/EmptyState";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const SCORING_LABELS: Record<string, string> = {
  days_active: "Dias ativos",
  checkin_count: "Check-ins",
  duration: "Duração",
  distance: "Distância",
  steps: "Passos",
  calories: "Calorias",
  custom_points: "Pontos",
};

const Ranking = () => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const navigate = useNavigate();
  const { data: group } = useGroupDetail(activeGroupId || undefined);
  const { data: members } = useGroupMembers(activeGroupId || undefined);
  const { data: checkins, isLoading } = useGroupCheckins(activeGroupId || undefined);

  const groupAny = group as any;
  const scoringMode = groupAny?.scoring_mode || "days_active";
  const isFinished = groupAny?.status === "finished";
  const daysRemaining = !isFinished && groupAny?.end_date
    ? Math.max(0, differenceInDays(new Date(groupAny.end_date), new Date()))
    : null;

  const ranked = useMemo(() => {
    if (!members || !checkins || !group) return [];

    const items = members.map((m) => {
      const profile = m.profiles as any;
      const userCheckins = checkins.filter((c) => c.user_id === m.user_id);

      let score = 0;
      let scoreLabel = "";

      switch (scoringMode) {
        case "checkin_count":
          score = userCheckins.length;
          scoreLabel = `${score} check-ins`;
          break;
        case "duration":
          score = userCheckins.reduce((sum, c) => sum + ((c as any).duration_min || 0), 0);
          scoreLabel = `${Math.floor(score / 60)}h ${score % 60}min`;
          break;
        case "distance":
          score = userCheckins.reduce((sum, c) => sum + (Number((c as any).distance_km) || 0), 0);
          scoreLabel = `${score.toFixed(1)} km`;
          break;
        case "steps":
          score = userCheckins.reduce((sum, c) => sum + ((c as any).steps || 0), 0);
          scoreLabel = `${score.toLocaleString()} passos`;
          break;
        case "calories":
          score = userCheckins.reduce((sum, c) => sum + ((c as any).calories || 0), 0);
          scoreLabel = `${score.toLocaleString()} kcal`;
          break;
        default: // days_active
          score = computeDaysActive(checkins, m.user_id);
          scoreLabel = `${score} dias`;
          break;
      }

      const streaks = computeStreaks(checkins, m.user_id);
      return {
        userId: m.user_id,
        name: profile?.display_name || "Sem nome",
        score,
        scoreLabel,
        ...streaks,
      };
    });

    items.sort((a, b) => b.score - a.score || b.current - a.current);

    let rank = 1;
    return items.map((item, i) => {
      if (i > 0 && item.score < items[i - 1].score) rank = i + 1;
      return { ...item, rank };
    });
  }, [members, checkins, group, scoringMode]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getMedalIcon = (r: number) => {
    if (r === 1) return "🥇";
    if (r === 2) return "🥈";
    if (r === 3) return "🥉";
    return null;
  };

  return (
    <AppScaffold title="Ranking" subtitle={group ? group.name : "Nenhum desafio ativo"}>
      {(!activeGroupId || !group) ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum desafio ativo"
          description="Entre ou crie um desafio para ver o ranking."
        >
          <Button onClick={() => navigate("/grupos/criar")} className="h-14 w-full rounded-[18px] text-body font-bold glow-primary">
            Criar desafio
          </Button>
          <Button onClick={() => navigate("/grupos/entrar")} variant="outline" className="h-14 w-full rounded-[18px] text-body font-bold border-subtle bg-surface-1">
            Entrar em um grupo
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {/* Info card */}
          <div className="rounded-[20px] surface-1 border border-subtle p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">Método de pontuação</p>
                <p className="text-body font-bold mt-0.5">{SCORING_LABELS[scoringMode] || "Dias ativos"}</p>
              </div>
              {daysRemaining !== null && (
                <div className="flex items-center gap-1 text-small text-primary font-medium">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {daysRemaining} dias restantes
                </div>
              )}
            </div>
          </div>

          {ranked.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Nenhum dado de ranking"
              description="Faça check-in para aparecer no ranking."
            />
          ) : (
            <div className="space-y-2">
              {ranked.map((m) => {
                const isMe = m.userId === user?.id;
                return (
                  <div
                    key={m.userId}
                    className={`flex items-center gap-4 rounded-[20px] surface-1 border p-4 transition-all ${
                      isMe ? "border-primary/30 glow-primary-sm" : "border-subtle"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                      {getMedalIcon(m.rank) ? (
                        <span className="text-lg">{getMedalIcon(m.rank)}</span>
                      ) : (
                        <span className="text-body font-bold text-muted-foreground">{m.rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-body font-bold truncate">
                          {m.name}
                          {isMe && <span className="ml-1 text-caption text-primary">(você)</span>}
                        </span>
                        <span className="text-body font-bold text-primary ml-2 shrink-0">{m.scoreLabel}</span>
                      </div>
                      <div className="mt-1 flex gap-3 text-caption text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-primary" /> {m.current} seguidos
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Recorde: {m.best}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppScaffold>
  );
};

export default Ranking;
