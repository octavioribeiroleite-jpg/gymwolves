import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks, hasCheckedInToday } from "@/hooks/useCheckins";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Flame, Trophy, Loader2, Target, Info, Dumbbell, Medal } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import CheckinDialog from "@/components/CheckinDialog";
import ActivityFeed from "@/components/ActivityFeed";
import EmptyState from "@/components/ds/EmptyState";
import StatCard from "@/components/ds/StatCard";
import SectionTitle from "@/components/ds/SectionTitle";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const navigate = useNavigate();
  const [checkinOpen, setCheckinOpen] = useState(false);

  const { data: group, isLoading } = useGroupDetail(activeGroupId || undefined);
  const { data: members } = useGroupMembers(activeGroupId || undefined);
  const { data: checkins } = useGroupCheckins(activeGroupId || undefined);

  const todayDone = useMemo(
    () => (checkins && user ? hasCheckedInToday(checkins, user.id) : false),
    [checkins, user]
  );

  const myStats = useMemo(() => {
    if (!checkins || !user || !group) return null;
    const days = computeDaysActive(checkins, user.id);
    const streaks = computeStreaks(checkins, user.id);
    const goal = (group as any).goal_total || 200;
    const pct = goal > 0 ? Math.min(Math.round((days / goal) * 100), 100) : 0;
    return { days, goal, pct, ...streaks };
  }, [checkins, user, group]);

  const topMembers = useMemo(() => {
    if (!members || !checkins || !group) return [];
    return members
      .map((m) => {
        const profile = m.profiles as any;
        const days = computeDaysActive(checkins, m.user_id);
        return { userId: m.user_id, name: profile?.display_name || "Sem nome", days };
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 3);
  }, [members, checkins, group]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeGroupId || !group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <EmptyState
          image={logo}
          title="CRIE OU ENTRE EM UM GRUPO"
          description="Treine com seus amigos e compita para ver quem treina mais."
        >
          <Button asChild size="lg" className="h-14 w-full rounded-2xl text-base font-semibold glow-primary">
            <Link to="/grupos/criar">Criar Grupo</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 w-full rounded-2xl text-base font-semibold border-0 bg-card">
            <Link to="/grupos/entrar">Entrar com Convite</Link>
          </Button>
        </EmptyState>
        <BottomNav />
      </div>
    );
  }

  const groupAny = group as any;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="GYM WOLVES" className="h-8 w-8 object-contain" />
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary font-display">GYM WOLVES</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl" onClick={() => navigate(`/grupos/${group.id}/detalhes`)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="font-display text-title-section mt-1">{group.name}</h1>
          {groupAny.start_date && groupAny.end_date && (
            <p className="text-description text-muted-foreground">
              {format(new Date(groupAny.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(groupAny.end_date), "dd MMM yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-5 p-4">
        {/* Check-in Card */}
        <Card className="overflow-hidden border-0 glow-primary">
          <CardContent className="p-0">
            <button
              onClick={() => setCheckinOpen(true)}
              className={`flex w-full items-center gap-4 p-6 transition-all duration-300 ${
                todayDone ? "gradient-primary" : "bg-card hover:bg-secondary"
              }`}
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all ${
                todayDone ? "bg-white/20" : "bg-primary/10"
              }`}>
                {todayDone ? (
                  <CheckCircle2 className="h-7 w-7 animate-check-bounce text-white" />
                ) : (
                  <Dumbbell className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-lg font-bold font-display ${todayDone ? "text-white" : "text-foreground"}`}>
                  {todayDone ? "Treino concluído! 💪" : "Registrar treino"}
                </p>
                <p className={`text-description ${todayDone ? "text-white/70" : "text-muted-foreground"}`}>
                  {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Stats */}
        {myStats && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Flame} value={myStats.current} label="Sequência" />
            <StatCard icon={Target} value={myStats.days} label="Treinos" />
            <StatCard icon={Trophy} value={myStats.best} label="Recorde" />
          </div>
        )}

        {/* Progress */}
        {myStats && (
          <Card className="border-0">
            <CardContent className="p-5">
              <SectionTitle>Meu Progresso</SectionTitle>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-description">
                  <span className="text-muted-foreground">Dias ativos</span>
                  <span className="font-bold text-primary">{myStats.days}/{myStats.goal}</span>
                </div>
                <Progress value={myStats.pct} className="h-3" />
                <p className="mt-2 text-right text-xs text-muted-foreground">{myStats.pct}% da meta</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mini Ranking */}
        {topMembers.length > 0 && (
          <Card className="border-0">
            <CardContent className="p-5">
              <SectionTitle
                action={
                  <Button variant="ghost" size="sm" className="h-7 rounded-2xl text-xs text-primary" onClick={() => navigate("/ranking")}>
                    Ver completo
                  </Button>
                }
              >
                Ranking
              </SectionTitle>
              <div className="mt-3 space-y-2">
                {topMembers.map((m, i) => (
                  <div key={m.userId} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${m.userId === user?.id ? "bg-primary/10" : "bg-secondary/50"}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <span className="text-sm">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {m.name}
                      {m.userId === user?.id && <span className="ml-1 text-xs text-muted-foreground">(você)</span>}
                    </span>
                    <span className="text-sm font-bold text-primary">{m.days} treinos</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        <ActivityFeed groupId={activeGroupId} />
      </div>

      <CheckinDialog
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        groupId={activeGroupId}
        alreadyCheckedIn={todayDone}
      />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
