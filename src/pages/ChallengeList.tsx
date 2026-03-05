import { useUserChallenges, useChallengeParticipants } from "@/hooks/useChallengeData";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useActiveChallenge } from "@/contexts/ActiveChallengeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Plus, LogIn, Users, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import logo from "@/assets/logo.png";
import BottomNav from "@/components/BottomNav";

const ChallengeCard = ({ challenge, onSelect }: { challenge: any; onSelect: () => void }) => {
  const { user } = useAuth();
  const { data: participants } = useChallengeParticipants(challenge.id);
  const { data: logs } = useWorkoutLogs(challenge.id);

  const myLogs = logs?.filter((l) => l.user_id === user?.id) ?? [];
  const pct = challenge.goal_days_per_user > 0
    ? Math.min(Math.round((myLogs.length / challenge.goal_days_per_user) * 100), 100)
    : 0;

  return (
    <Card className="border-0 cursor-pointer transition-all hover:ring-2 hover:ring-primary/30 active:scale-[0.98]" onClick={onSelect}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-bold">{challenge.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{participants?.length ?? 0}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {format(new Date(challenge.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(challenge.end_date), "dd MMM yyyy", { locale: ptBR })}
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Meu progresso</span>
            <span className="font-semibold text-primary">{myLogs.length}/{challenge.goal_days_per_user}</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

const ChallengeList = () => {
  const { data: challenges, isLoading } = useUserChallenges();
  const { setActiveChallengeId } = useActiveChallenge();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    setActiveChallengeId(id);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
        <img src={logo} alt="GYM WOLVES" className="h-24 w-24 object-contain drop-shadow-[0_0_20px_hsl(142_71%_45%/0.3)]" />
        <div>
          <h1 className="text-2xl font-bold tracking-[0.15em]" style={{ fontFamily: "'Anton', sans-serif" }}>
            CRIE SEU PRIMEIRO DESAFIO
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monte um desafio e convide seu parceiro(a) para treinar junto.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button onClick={() => navigate("/desafios/criar")} size="lg" className="h-14 w-full rounded-2xl text-base font-semibold glow-primary">
            <Plus className="mr-2 h-5 w-5" /> Criar Desafio
          </Button>
          <Button onClick={() => navigate("/desafios/entrar")} variant="outline" size="lg" className="h-14 w-full rounded-2xl text-base font-semibold border-0 bg-card">
            <LogIn className="mr-2 h-5 w-5" /> Entrar com Convite
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <h1 className="font-display text-xl font-bold">Meus Desafios</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => navigate("/desafios/entrar")}>
              <LogIn className="h-4 w-4" />
            </Button>
            <Button size="sm" className="rounded-xl" onClick={() => navigate("/desafios/criar")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-md space-y-3 p-4">
        {challenges.map((c) => (
          <ChallengeCard key={c.id} challenge={c} onSelect={() => handleSelect(c.id)} />
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default ChallengeList;
