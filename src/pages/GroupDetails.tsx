import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers, useRemoveMember, useLeaveGroup } from "@/hooks/useGroupData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, Copy, Loader2, LogOut, Target, Trash2, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setActiveGroupId } = useActiveGroup();
  const { data: group, isLoading } = useGroupDetail(id);
  const { data: members } = useGroupMembers(id);
  const removeMember = useRemoveMember();
  const leaveGroup = useLeaveGroup();

  const isAdmin = group?.created_by === user?.id;
  const groupAny = group as any;

  const handleLeave = () => {
    if (!id) return;
    if (confirm("Tem certeza que deseja sair deste grupo?")) {
      leaveGroup.mutate(id, {
        onSuccess: () => {
          setActiveGroupId(null);
          navigate("/grupos");
        },
      });
    }
  };

  const handleRemove = (memberId: string, name: string) => {
    if (!id) return;
    if (confirm(`Remover ${name} do grupo?`)) {
      removeMember.mutate({ memberId, groupId: id });
    }
  };

  const copyCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
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
          <h1 className="font-display text-xl font-bold">Detalhes do Grupo</h1>
        </div>
      </header>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <Card className="border-0">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">{group?.name}</h2>
            </div>
            {groupAny?.start_date && groupAny?.end_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(groupAny.start_date), "dd MMM yyyy", { locale: ptBR })} — {format(new Date(groupAny.end_date), "dd MMM yyyy", { locale: ptBR })}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Meta: <strong className="text-foreground">{groupAny?.goal_total || 200} dias</strong>
            </div>
            <div className="text-xs text-muted-foreground">
              Tipo: {groupAny?.type === "challenge" ? "Desafio" : "Clube"} · Scoring: Days Active
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-5">
            <p className="mb-2 text-xs text-muted-foreground">Código de convite</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl bg-secondary px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
                {group?.invite_code}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-xl border-0 bg-secondary">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold font-display">
              <Users className="h-4 w-4 text-primary" /> Membros ({members?.length ?? 0})
            </h3>
            <div className="space-y-2">
              {members?.map((m) => {
                const profile = m.profiles as any;
                const isSelf = m.user_id === user?.id;
                const memberRole = (m as any).role;
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                    <span className="font-medium">
                      {profile?.display_name || "Sem nome"}
                      {isSelf && <span className="ml-1 text-xs text-muted-foreground">(você)</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      {memberRole === "admin" && (
                        <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>
                      )}
                      {isAdmin && !isSelf && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(m.id, profile?.display_name || "membro")}
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

        <Button
          variant="outline"
          onClick={handleLeave}
          className="h-14 w-full rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10"
          disabled={leaveGroup.isPending}
        >
          {leaveGroup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          Sair do Grupo
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default GroupDetails;
