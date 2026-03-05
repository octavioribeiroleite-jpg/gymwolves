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
import logo from "@/assets/logo.png";
import { ptBR } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import CheckinDialog from "@/components/CheckinDialog";

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

  // Mini ranking
  const topMembers = useMemo(() => {
    if (!members || !checkins || !group) return [];
    return members
      .map((m) => {
        const profile = m.profiles as any;
        const days = computeDaysActive(checkins, m.user_id);
        const goal = (group as any).goal_total || 200;
        const pct = goal > 0 ? Math.min(Math.round((days / goal) * 100), 100) : 0;
        return { userId: m.user_id, name: profile?.display_name || "Sem nome", days, pct };
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
        <img src={logo} alt="GYM WOLVES" className="h-24 w-24 object-contain drop-shadow-[0_0_20px_hsl(142_71%_45%/0.3)]" />
        <div>
          <h1 className="text-3xl font-bold tracking-[0.15em]" style={{ fontFamily: "'Anton', sans-serif" }}>GYM WOLVES 🐺</h1>
          <p className="mt-2 text-muted-foreground">Crie ou entre em um grupo para começar.</p>
        </div>
        <Button asChild size="lg" className="h-14 w-full max-w-xs rounded-2xl text-base font-semibold glow-primary">
          <Link to="/grupos">Ver Grupos</Link>
        </Button>
        <BottomNav />
      </div>
    );
  }

  const groupAny = group as any;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="GYM WOLVES" className="h-8 w-8 object-contain" />
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary" style={{ fontFamily: "'Anton', sans-serif" }}>GYM WOLVES</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => navigate(`/grupos/${group.id}/detalhes`)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="font-display text-xl font-bold">{group.name}</h1>
          {groupAny.start_date && groupAny.end_date && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(groupAny.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(groupAny.end_date), "dd MMM yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Check-in button */}
        <Card className="overflow-hidden border-0 glow-primary">
          <CardContent className="p-0">
            <button
              onClick={() => setCheckinOpen(true)}
              className={`flex w-full items-center gap-4 p-6 transition-all duration-300 ${
                todayDone ? "gradient-primary" : "bg-card hover:bg-secondary"
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
                <p className={`text-lg font-bold font-display ${todayDone ? "text-primary-foreground" : "text-foreground"}`}>
                  {todayDone ? "Treino concluído! 💪" : "Concluir treino hoje"}
                </p>
                <p className={`text-sm ${todayDone ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
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
                <span className="text-[11px] text-muted-foreground">Days Active</span>
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
                <span className="text-sm font-bold text-primary">{myStats.days}/{myStats.goal}</span>
              </div>
              <Progress value={myStats.pct} className="h-3" />
              <p className="mt-2 text-right text-xs text-muted-foreground">{myStats.pct}% da meta</p>
            </CardContent>
          </Card>
        )}

        {/* Mini ranking */}
        {topMembers.length > 0 && (
          <Card className="border-0">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold font-display">Ranking</h3>
                <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs text-primary" onClick={() => navigate("/ranking")}>
                  Ver completo
                </Button>
              </div>
              <div className="space-y-2">
                {topMembers.map((m, i) => (
                  <div key={m.userId} className="flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      {i < 3 ? (
                        <Medal className={`h-4 w-4 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : "text-amber-700"}`} />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {m.name}
                      {m.userId === user?.id && <span className="ml-1 text-xs text-muted-foreground">(você)</span>}
                    </span>
                    <span className="text-sm font-bold text-primary">{m.days}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
