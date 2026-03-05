import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers, useRemoveMember, useLeaveGroup } from "@/hooks/useGroupData";
import { Button } from "@/components/ui/button";
import { CalendarDays, Copy, Loader2, LogOut, Target, Trash2, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import AppScaffold from "@/components/ds/AppScaffold";
import SectionTitle from "@/components/ds/SectionTitle";

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
    <AppScaffold title="Detalhes do grupo" showBack>
      {/* Info */}
      <div className="rounded-[20px] surface-1 border border-subtle p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-h2">{group?.name}</h2>
        </div>
        {groupAny?.start_date && groupAny?.end_date && (
          <div className="flex items-center gap-2 text-subtitle text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {format(new Date(groupAny.start_date), "dd MMM yyyy", { locale: ptBR })} — {format(new Date(groupAny.end_date), "dd MMM yyyy", { locale: ptBR })}
          </div>
        )}
        <div className="flex items-center gap-2 text-subtitle text-muted-foreground">
          <Target className="h-4 w-4" />
          Meta: <strong className="text-foreground">{groupAny?.goal_total || 200} dias</strong>
        </div>
        <p className="text-caption text-muted-foreground">
          Tipo: {groupAny?.type === "challenge" ? "Desafio" : "Clube"} · Pontuação: Dias ativos
        </p>
      </div>

      {/* Invite code */}
      <div className="rounded-[20px] surface-1 border border-subtle p-5">
        <p className="mb-2 text-caption text-muted-foreground">Código de convite</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-[16px] bg-secondary px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
            {group?.invite_code}
          </code>
          <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-[16px] border-subtle bg-secondary">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Members */}
      <div className="rounded-[20px] surface-1 border border-subtle p-5">
        <SectionTitle>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Membros ({members?.length ?? 0})
          </span>
        </SectionTitle>
        <div className="mt-3 space-y-2">
          {members?.map((m) => {
            const profile = m.profiles as any;
            const isSelf = m.user_id === user?.id;
            const memberRole = (m as any).role;
            return (
              <div key={m.id} className="flex items-center justify-between rounded-[16px] bg-secondary px-4 py-3">
                <span className="text-body font-medium">
                  {profile?.display_name || "Sem nome"}
                  {isSelf && <span className="ml-1 text-caption text-muted-foreground">(você)</span>}
                </span>
                <div className="flex items-center gap-2">
                  {memberRole === "admin" && (
                    <span className="rounded-xl bg-primary/15 px-2 py-0.5 text-caption font-medium text-primary">Admin</span>
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
      </div>

      {/* Leave */}
      <Button
        variant="outline"
        onClick={handleLeave}
        className="h-14 w-full rounded-[18px] border-destructive/30 text-destructive hover:bg-destructive/10"
        disabled={leaveGroup.isPending}
      >
        {leaveGroup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
        Sair do grupo
      </Button>
    </AppScaffold>
  );
};

export default GroupDetails;
