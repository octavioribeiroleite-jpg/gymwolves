import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks, hasCheckedInToday } from "@/hooks/useCheckins";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Flame, Trophy, Loader2, Target, Dumbbell, CalendarDays } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import CheckinDialog from "@/components/CheckinDialog";
import ActivityFeed from "@/components/ActivityFeed";
import StatCard from "@/components/ds/StatCard";
import ProgressCard from "@/components/ds/ProgressCard";
import SectionTitle from "@/components/ds/SectionTitle";
import SidebarMenu from "@/components/SidebarMenu";
import FloatingActionButton from "@/components/FloatingActionButton";
import Onboarding from "./Onboarding";
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

  const daysRemaining = useMemo(() => {
    if (!group) return null;
    const g = group as any;
    if (!g.end_date) return null;
    const diff = differenceInDays(new Date(g.end_date), new Date());
    return Math.max(0, diff);
  }, [group]);

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

  // No group — show onboarding
  if (!activeGroupId || !group) {
    return <Onboarding />;
  }

  const groupAny = group as any;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-subtle bg-background/95 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarMenu />
              <img src={logo} alt="GYM WOLVES" className="h-6 w-6 object-contain" />
              <span className="text-caption font-bold uppercase tracking-[0.15em] text-primary">GYM WOLVES</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 px-5 py-4">
        {/* Group info */}
        <div>
          <h1 className="text-h1">{group.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-small text-muted-foreground">
            {groupAny.start_date && groupAny.end_date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(new Date(groupAny.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(groupAny.end_date), "dd MMM yyyy", { locale: ptBR })}
              </span>
            )}
            {daysRemaining !== null && (
              <span className="text-primary font-medium">{daysRemaining} dias restantes</span>
            )}
          </div>
        </div>

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
            <p className={`text-small ${todayDone ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </button>

        {/* Stats */}
        {myStats && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Flame} value={myStats.current} label="Sequência" />
            <StatCard icon={Target} value={myStats.days} label="Dias ativos" />
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

      {/* FAB */}
      <FloatingActionButton onClick={() => setCheckinOpen(true)} />

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
