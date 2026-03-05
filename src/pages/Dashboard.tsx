import { useAuth } from "@/contexts/AuthContext";
import { useUserGroups, useGroupMembers } from "@/hooks/useGroup";
import { useGroupChallenges } from "@/hooks/useChallenge";
import { useWorkoutLogs, useToggleWorkout, computeStreaks } from "@/hooks/useWorkoutLogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Flame, Trophy, Loader2, Dumbbell, LogOut } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useMemo } from "react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
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

  const memberStats = useMemo(() => {
    if (!members || !logs || !challenge) return [];
    return members.map((m) => {
      const profile = m.profiles as any;
      const userLogs = logs.filter((l) => l.user_id === m.user_id);
      const dates = userLogs.map((l) => l.workout_date);
      const streaks = computeStreaks(dates);
      const pct = challenge.goal_days_per_user > 0
        ? Math.round((dates.length / challenge.goal_days_per_user) * 100)
        : 0;
      return {
        userId: m.user_id,
        name: profile?.display_name || "Sem nome",
        days: dates.length,
        goal: challenge.goal_days_per_user,
        pct: Math.min(pct, 100),
        ...streaks,
      };
    }).sort((a, b) => b.days - a.days);
  }, [members, logs, challenge]);

  const handleToggle = () => {
    if (!challenge) return;
    toggleWorkout.mutate({ challengeId: challenge.id, date: today, isCompleted: todayCompleted });
  };

  if (gLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Dumbbell className="h-16 w-16 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Bem-vindo!</h1>
        <p className="text-muted-foreground">
          Crie ou entre em um grupo para começar seu desafio de treinos.
        </p>
        <div className="flex gap-3">
          <Button asChild><Link to="/grupo">Ir para Grupos</Link></Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Grupo: {group.name}</h1>
        <p className="text-muted-foreground">Crie um desafio para começar a registrar treinos.</p>
        <Button asChild><Link to="/desafio">Criar Desafio</Link></Button>
        <BottomNav />
      </div>
    );
  }

  const totalLogs = logs?.length ?? 0;
  const totalGoal = (challenge.goal_days_per_user ?? 0) * (members?.length ?? 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold">{challenge.name}</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(challenge.start_date), "dd/MM/yyyy")} — {format(new Date(challenge.end_date), "dd/MM/yyyy")}
            </p>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Toggle workout button */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm text-muted-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <Button
              size="lg"
              onClick={handleToggle}
              disabled={toggleWorkout.isPending}
              className={`mt-2 h-16 w-full gap-3 text-lg font-semibold transition-all ${
                todayCompleted
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
              variant={todayCompleted ? "default" : "outline"}
            >
              {toggleWorkout.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : todayCompleted ? (
                <CheckCircle2 className={`h-6 w-6 ${todayCompleted ? "animate-check-bounce" : ""}`} />
              ) : (
                <Circle className="h-6 w-6" />
              )}
              {todayCompleted ? "Treino concluído ✅" : "Marcar treino de hoje"}
            </Button>
          </CardContent>
        </Card>

        {/* Member progress */}
        {memberStats.map((m, i) => (
          <Card key={m.userId} className={i === 0 ? "border-primary/30" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-display">
                  {i === 0 && <Trophy className="h-4 w-4 text-accent" />}
                  {m.name}
                  {m.userId === user?.id && (
                    <span className="text-xs text-muted-foreground">(você)</span>
                  )}
                </CardTitle>
                <span className="text-sm font-semibold text-primary">
                  {m.days}/{m.goal} dias
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>{m.pct}%</span>
                </div>
                <Progress value={m.pct} className="h-2.5" />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-accent" />
                  <span>
                    <strong>{m.current}</strong> dias seguidos
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span>
                    Melhor: <strong>{m.best}</strong>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Group progress */}
        {totalGoal > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Progresso do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{totalLogs}/{totalGoal} dias totais</span>
                <span>{Math.round((totalLogs / totalGoal) * 100)}%</span>
              </div>
              <Progress value={Math.min((totalLogs / totalGoal) * 100, 100)} className="h-2.5" />
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
