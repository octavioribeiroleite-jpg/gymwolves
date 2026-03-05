import { useAuth } from "@/contexts/AuthContext";
import { useUserGroups, useGroupMembers } from "@/hooks/useGroup";
import { useGroupChallenges } from "@/hooks/useChallenge";
import { useWorkoutLogs, useToggleWorkout, computeStreaks } from "@/hooks/useWorkoutLogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Flame, Trophy, Loader2, Dumbbell, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useMemo } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: groups, isLoading: gLoading } = useUserGroups();
  const group = groups?.[0];
  const { data: members } = useGroupMembers(group?.id);
  const { data: challenges } = useGroupChallenges(group?.id);
  const challenge = challenges?.[0];
  const { data: logs, isLoading: logsLoading } = useWorkoutLogs(challenge?.id);
  const toggleWorkout = useToggleWorkout();

  const today = format(new Date(), "yyyy-MM-dd");

  const todayCompleted = useMemo(
    () => logs?.some((l) => l.user_id === user?.id && l.workout_date === today) ?? false,
    [logs, user, today]
  );

  const myStats = useMemo(() => {
    if (!logs || !user || !challenge) return null;
    const userLogs = logs.filter((l) => l.user_id === user.id);
    const dates = userLogs.map((l) => l.workout_date);
    const streaks = computeStreaks(dates);
    const pct = challenge.goal_days_per_user > 0
      ? Math.round((dates.length / challenge.goal_days_per_user) * 100)
      : 0;
    return { days: dates.length, goal: challenge.goal_days_per_user, pct: Math.min(pct, 100), ...streaks };
  }, [logs, user, challenge]);

  const handleToggle = () => {
    if (!challenge) return;
    toggleWorkout.mutate({ challengeId: challenge.id, date: today, isCompleted: todayCompleted });
  };

  if (gLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Dumbbell className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Bem-vindo ao Ratos de Academia!</h1>
          <p className="mt-2 text-muted-foreground">
            Crie ou entre em um grupo para começar seu desafio.
          </p>
        </div>
        <Button asChild size="lg" className="h-14 w-full max-w-xs rounded-2xl text-base font-semibold glow-primary">
          <Link to="/grupo">Ir para Grupos</Link>
        </Button>
        <BottomNav />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Grupo: {group.name}</h1>
          <p className="mt-2 text-muted-foreground">Crie um desafio para começar.</p>
        </div>
        <Button asChild size="lg" className="h-14 w-full max-w-xs rounded-2xl text-base font-semibold glow-primary">
          <Link to="/desafio">Criar Desafio</Link>
        </Button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            🐀 Ratos de Academia
          </p>
          <h1 className="font-display text-xl font-bold">{challenge.name}</h1>
          <p className="text-xs text-muted-foreground">
            {format(new Date(challenge.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(challenge.end_date), "dd MMM yyyy", { locale: ptBR })}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Today's workout toggle */}
        <Card className="overflow-hidden border-0 glow-primary">
          <CardContent className="p-0">
            <button
              onClick={handleToggle}
              disabled={toggleWorkout.isPending}
              className={`flex w-full items-center gap-4 p-6 transition-all duration-300 ${
                todayCompleted
                  ? "gradient-primary"
                  : "bg-card hover:bg-secondary"
              }`}
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all ${
                todayCompleted
                  ? "bg-primary-foreground/20"
                  : "bg-primary/10"
              }`}>
                {toggleWorkout.isPending ? (
                  <Loader2 className={`h-7 w-7 animate-spin ${todayCompleted ? "text-primary-foreground" : "text-primary"}`} />
                ) : todayCompleted ? (
                  <CheckCircle2 className="h-7 w-7 animate-check-bounce text-primary-foreground" />
                ) : (
                  <Circle className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-lg font-bold font-display ${todayCompleted ? "text-primary-foreground" : "text-foreground"}`}>
                  {todayCompleted ? "Treino concluído! 💪" : "Marcar treino hoje"}
                </p>
                <p className={`text-sm ${todayCompleted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Stats row */}
        {myStats && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-0">
              <CardContent className="flex flex-col items-center p-4">
                <Flame className="mb-1 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold font-display">{myStats.current}</span>
                <span className="text-[11px] text-muted-foreground">Sequência</span>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="flex flex-col items-center p-4">
                <Target className="mb-1 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold font-display">{myStats.days}</span>
                <span className="text-[11px] text-muted-foreground">Treinos</span>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="flex flex-col items-center p-4">
                <Trophy className="mb-1 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold font-display">{myStats.best}</span>
                <span className="text-[11px] text-muted-foreground">Recorde</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My progress */}
        {myStats && (
          <Card className="border-0">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold font-display">Meu Progresso</span>
                <span className="text-sm font-bold text-primary">
                  {myStats.days}/{myStats.goal}
                </span>
              </div>
              <Progress value={myStats.pct} className="h-3" />
              <p className="mt-2 text-right text-xs text-muted-foreground">{myStats.pct}% da meta</p>
            </CardContent>
          </Card>
        )}

        {/* Group progress */}
        {members && members.length > 1 && (
          <Card className="border-0">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold font-display">Progresso do Grupo</h3>
              <div className="space-y-3">
                {members.map((m) => {
                  const profile = m.profiles as any;
                  const userLogs = logs?.filter((l) => l.user_id === m.user_id) ?? [];
                  const pct = challenge.goal_days_per_user > 0
                    ? Math.min(Math.round((userLogs.length / challenge.goal_days_per_user) * 100), 100)
                    : 0;
                  return (
                    <div key={m.user_id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium">
                          {profile?.display_name || "Sem nome"}
                          {m.user_id === user?.id && <span className="ml-1 text-muted-foreground">(você)</span>}
                        </span>
                        <span className="text-muted-foreground">{userLogs.length} dias</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
