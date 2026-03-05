import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Trophy, Flame, Loader2 } from "lucide-react";
import AppScaffold from "@/components/ds/AppScaffold";
import EmptyState from "@/components/ds/EmptyState";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Ranking = () => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const navigate = useNavigate();
  const { data: group } = useGroupDetail(activeGroupId || undefined);
  const { data: members } = useGroupMembers(activeGroupId || undefined);
  const { data: checkins, isLoading } = useGroupCheckins(activeGroupId || undefined);

  const ranked = useMemo(() => {
    if (!members || !checkins || !group) return [];
    const goal = (group as any).goal_total || 200;

    const items = members.map((m) => {
      const profile = m.profiles as any;
      const days = computeDaysActive(checkins, m.user_id);
      const streaks = computeStreaks(checkins, m.user_id);
      const pct = goal > 0 ? Math.min(Math.round((days / goal) * 100), 100) : 0;
      return { userId: m.user_id, name: profile?.display_name || "Sem nome", days, pct, goal, ...streaks };
    });

    items.sort((a, b) => b.days - a.days || b.current - a.current);

    let rank = 1;
    return items.map((item, i) => {
      if (i > 0 && item.days < items[i - 1].days) rank = i + 1;
      return { ...item, rank };
    });
  }, [members, checkins, group]);

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
    <AppScaffold title="Ranking" subtitle={group ? `${group.name} · Dias ativos` : "Nenhum desafio ativo"}>
      {(!activeGroupId || !group || ranked.length === 0) ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum dado de ranking"
          description="Nenhum desafio ativo para exibir o ranking."
        >
          <Button onClick={() => navigate("/grupos/criar")} className="h-14 w-full rounded-[18px] text-body font-bold glow-primary">
            Criar desafio
          </Button>
          <Button onClick={() => navigate("/grupos/entrar")} variant="outline" className="h-14 w-full rounded-[18px] text-body font-bold border-subtle bg-surface-1">
            Entrar em um grupo
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-2">
          {/* Period info */}
          {(group as any).start_date && (group as any).end_date && (
            <div className="rounded-[20px] surface-1 border border-subtle p-4 mb-2">
              <p className="text-caption text-muted-foreground">Método de pontuação</p>
              <p className="text-body font-bold mt-0.5">Dias ativos</p>
            </div>
          )}

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
                      {isMe && <span className="ml-1 text-caption text-muted-foreground">(você)</span>}
                    </span>
                    <span className="text-body font-bold text-primary ml-2 shrink-0">{m.days} treinos</span>
                  </div>
                  <div className="mt-1.5 flex gap-3 text-caption text-muted-foreground">
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
    </AppScaffold>
  );
};

export default Ranking;
