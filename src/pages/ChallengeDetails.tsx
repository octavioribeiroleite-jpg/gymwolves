import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveChallenge } from "@/contexts/ActiveChallengeContext";
import {
  useChallengeDetail,
  useChallengeParticipants,
  useRemoveParticipant,
  useLeaveChallenge,
} from "@/hooks/useChallengeData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, Copy, Loader2, LogOut, Target, Trash2, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const ChallengeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setActiveChallengeId } = useActiveChallenge();
  const { data: challenge, isLoading } = useChallengeDetail(id);
  const { data: participants } = useChallengeParticipants(id);
  const removeParticipant = useRemoveParticipant();
  const leaveChallenge = useLeaveChallenge();

  const isOwner = challenge?.created_by === user?.id;

  const handleLeave = () => {
    if (!id) return;
    if (confirm("Tem certeza que deseja sair deste desafio?")) {
      leaveChallenge.mutate(id, {
        onSuccess: () => {
          setActiveChallengeId(null);
          navigate("/desafios");
        },
      });
    }
  };

  const handleRemove = (participantId: string, name: string) => {
    if (!id) return;
    if (confirm(`Remover ${name} do desafio?`)) {
      removeParticipant.mutate({ participantId, challengeId: id });
    }
  };

  const copyCode = () => {
    if (challenge?.invite_code) {
      navigator.clipboard.writeText(challenge.invite_code);
      toast.success("Código copiado!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-xl font-bold">Detalhes do Desafio</h1>
        </div>
      </header>
      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Challenge info */}
        <Card className="border-0">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">{challenge?.name}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {challenge && format(new Date(challenge.start_date), "dd MMM yyyy", { locale: ptBR })} — {challenge && format(new Date(challenge.end_date), "dd MMM yyyy", { locale: ptBR })}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Meta: <strong className="text-foreground">{challenge?.goal_days_per_user} dias</strong>
            </div>
          </CardContent>
        </Card>

        {/* Invite code */}
        <Card className="border-0">
          <CardContent className="p-5">
            <p className="mb-2 text-xs text-muted-foreground">Código de convite</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl bg-secondary px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
                {challenge?.invite_code}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-xl border-0 bg-secondary">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="border-0">
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold font-display">
              <Users className="h-4 w-4 text-primary" /> Participantes ({participants?.length ?? 0})
            </h3>
            <div className="space-y-2">
              {participants?.map((p) => {
                const profile = p.profiles as any;
                const isSelf = p.user_id === user?.id;
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                    <div>
                      <span className="font-medium">
                        {profile?.display_name || "Sem nome"}
                        {isSelf && <span className="ml-1 text-xs text-muted-foreground">(você)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.role === "owner" && (
                        <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Dono</span>
                      )}
                      {isOwner && !isSelf && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(p.id, profile?.display_name || "participante")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leave */}
        <Button
          variant="outline"
          onClick={handleLeave}
          className="h-14 w-full rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10"
          disabled={leaveChallenge.isPending}
        >
          {leaveChallenge.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          Sair do Desafio
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ChallengeDetails;
