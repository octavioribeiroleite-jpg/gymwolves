import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveChallenge } from "@/contexts/ActiveChallengeContext";
import { useChallengeDetail, useChallengeParticipants } from "@/hooks/useChallengeData";
import { useWorkoutLogs, computeStreaks } from "@/hooks/useWorkoutLogs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Loader2, Medal } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Ranking = () => {
  const { user } = useAuth();
  const { activeChallengeId } = useActiveChallenge();
  const { data: challenge } = useChallengeDetail(activeChallengeId || undefined);
  const { data: participants } = useChallengeParticipants(activeChallengeId || undefined);
  const { data: logs, isLoading: logsLoading } = useWorkoutLogs(activeChallengeId || undefined);

  const ranked = useMemo(() => {
    if (!participants || !logs || !challenge) return [];
    return participants
      .map((p) => {
        const profile = p.profiles as any;
        const userLogs = logs.filter((l) => l.user_id === p.user_id);
        const dates = userLogs.map((l) => l.workout_date);
        const streaks = computeStreaks(dates);
        const pct = challenge.goal_days_per_user > 0
          ? Math.min(Math.round((dates.length / challenge.goal_days_per_user) * 100), 100)
          : 0;
        return {
          userId: p.user_id,
          name: profile?.display_name || "Sem nome",
          avatar: profile?.avatar_url,
          days: dates.length,
          goal: challenge.goal_days_per_user,
          pct,
          ...streaks,
        };
      })
      .sort((a, b) => b.days - a.days || b.current - a.current);
  }, [participants, logs, challenge]);

  if (logsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getMedalColor = (i: number) => {
    if (i === 0) return "text-yellow-400";
    if (i === 1) return "text-gray-400";
    if (i === 2) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-xl font-bold">Ranking</h1>
          <p className="text-xs text-muted-foreground">
            {challenge ? challenge.name : "Nenhum desafio ativo"}
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

        {ranked.map((m, i) => (
          <Card key={m.userId} className={`border-0 transition-all ${i === 0 ? "glow-primary" : ""}`}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                {i < 3 ? (
                  <Medal className={`h-5 w-5 ${getMedalColor(i)}`} />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
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
                <div className="mt-1.5 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-primary" /> {m.current} seguidos
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" /> Recorde: {m.best}
                  </span>
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
