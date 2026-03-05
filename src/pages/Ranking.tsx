import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Loader2, Medal } from "lucide-react";
import AppScaffold from "@/components/ds/AppScaffold";
import EmptyState from "@/components/ds/EmptyState";

const Ranking = () => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
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
      {ranked.length === 0 ? (
        <EmptyState icon={Trophy} title="Nenhum dado disponível" description="Nenhum desafio ativo para exibir o ranking." />
      ) : (
        ranked.map((m) => {
          const isMe = m.userId === user?.id;
          return (
            <Card key={m.userId} className={`border-0 transition-all ${isMe ? "ring-1 ring-primary/30 glow-primary" : ""}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                  {getMedalIcon(m.rank) ? (
                    <span className="text-lg">{getMedalIcon(m.rank)}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{m.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold font-display truncate">
                      {m.name}
                      {isMe && <span className="ml-1 text-xs text-muted-foreground">(você)</span>}
                    </span>
                    <span className="text-sm font-bold text-primary ml-2 shrink-0">{m.days} treinos</span>
                  </div>
                  <Progress value={m.pct} className="mt-2 h-2" />
                  <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-primary" /> {m.current} seguidos
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Recorde: {m.best}
                      </span>
                    </div>
                    <span>{m.pct}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </AppScaffold>
  );
};

export default Ranking;
