import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Loader2, Medal } from "lucide-react";
import BottomNav from "@/components/BottomNav";

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
      return {
        userId: m.user_id,
        name: profile?.display_name || "Sem nome",
        days,
        pct,
        goal,
        ...streaks,
      };
    });

    // Sort: days DESC, current streak DESC
    items.sort((a, b) => b.days - a.days || b.current - a.current);

    // Standard competition ranking
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

  const getMedalColor = (r: number) => {
    if (r === 1) return "text-yellow-400";
    if (r === 2) return "text-gray-400";
    if (r === 3) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-xl font-bold">Ranking</h1>
          <p className="text-xs text-muted-foreground">
            {group ? group.name : "Nenhum grupo ativo"} · Days Active
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-3 p-4">
        {ranked.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum dado de ranking disponível.</p>
          </div>
        )}

        {ranked.map((m) => (
          <Card key={m.userId} className={`border-0 transition-all ${m.rank === 1 ? "glow-primary" : ""}`}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                {m.rank <= 3 ? (
                  <Medal className={`h-5 w-5 ${getMedalColor(m.rank)}`} />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{m.rank}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold font-display">
                    {m.name}
                    {m.userId === user?.id && (
                      <span className="ml-1 text-xs text-muted-foreground">(você)</span>
                    )}
                  </span>
                  <span className="text-sm font-bold text-primary">{m.days} dias</span>
                </div>
                <Progress value={m.pct} className="mt-2 h-2" />
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <div className="flex gap-4">
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
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Ranking;
