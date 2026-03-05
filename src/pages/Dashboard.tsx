import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks, hasCheckedInToday } from "@/hooks/useCheckins";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Flame, Trophy, Loader2, Target, Info, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import CheckinDialog from "@/components/CheckinDialog";
import ActivityFeed from "@/components/ActivityFeed";
import EmptyState from "@/components/ds/EmptyState";
import StatCard from "@/components/ds/StatCard";
import ProgressCard from "@/components/ds/ProgressCard";
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

  // No group — welcome screen
  if (!activeGroupId || !group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
        <EmptyState
          image={logo}
          title="Crie ou entre em um grupo"
          description="Treine com seus amigos e compita para ver quem treina mais."
        >
          <Button asChild size="lg" className="h-14 w-full rounded-[18px] text-body font-bold glow-primary">
            <Link to="/grupos/criar">Criar grupo</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 w-full rounded-[18px] text-body font-bold border-subtle bg-surface-1">
            <Link to="/grupos/entrar">Entrar com convite</Link>
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
      <header className="sticky top-0 z-40 border-b border-subtle bg-background/95 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="GYM WOLVES" className="h-7 w-7 object-contain" />
              <span className="text-caption font-bold uppercase tracking-[0.15em] text-primary">GYM WOLVES</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl" onClick={() => navigate(`/grupos/${group.id}/detalhes`)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-h1 mt-1">{group.name}</h1>
          {groupAny.start_date && groupAny.end_date && (
            <p className="text-subtitle text-muted-foreground">
              {format(new Date(groupAny.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(groupAny.end_date), "dd MMM yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 px-5 py-4">
        {/* Check-in Card */}
        <button
          onClick={() => setCheckinOpen(true)}
          className={`flex w-full items-center gap-4 rounded-[20px] p-5 transition-all duration-300 border border-subtle ${
            todayDone ? "gradient-primary glow-primary" : "surface-1 hover:bg-surface-2"
          }`}
        >
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all ${
            todayDone ? "bg-primary-foreground/20" : "bg-primary/10"
          }`}>
            {todayDone ? (
              <CheckCircle2 className="h-7 w-7 animate-check-bounce text-primary-foreground" />
            ) : (
              <Dumbbell className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className={`text-h2 ${todayDone ? "text-primary-foreground" : ""}`}>
              {todayDone ? "Treino concluído! 💪" : "Registrar treino"}
            </p>
            <p className={`text-subtitle ${todayDone ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </button>

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
          <ProgressCard label="Meu progresso" current={myStats.days} total={myStats.goal} />
        )}

        {/* Mini Ranking */}
        {topMembers.length > 0 && (
          <div className="rounded-[20px] surface-1 border border-subtle p-4">
            <SectionTitle
              action={
                <Button variant="ghost" size="sm" className="h-7 rounded-2xl text-caption text-primary" onClick={() => navigate("/ranking")}>
                  Ver completo
                </Button>
              }
            >
              Ranking
            </SectionTitle>
            <div className="mt-3 space-y-2">
              {topMembers.map((m, i) => (
                <div key={m.userId} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${m.userId === user?.id ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <span className="text-small">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                  </div>
                  <span className="flex-1 text-body font-medium truncate">
                    {m.name}
                    {m.userId === user?.id && <span className="ml-1 text-caption text-muted-foreground">(você)</span>}
                  </span>
                  <span className="text-body font-bold text-primary">{m.days}</span>
                </div>
              ))}
            </div>
          </div>
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
