import { useUserGroups, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive } from "@/hooks/useCheckins";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Plus, LogIn, Users, CalendarDays, ChevronRight } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import logo from "@/assets/logo.png";
import AppScaffold from "@/components/ds/AppScaffold";
import EmptyState from "@/components/ds/EmptyState";
import { toast } from "sonner";

const GroupCard = ({
  group,
  isActive,
  onOpen,
  onSetActive,
}: {
  group: any;
  isActive: boolean;
  onOpen: () => void;
  onSetActive: () => void;
}) => {
  const { user } = useAuth();
  const { data: members } = useGroupMembers(group.id);
  const { data: checkins } = useGroupCheckins(group.id);

  const myDays = checkins && user ? computeDaysActive(checkins, user.id) : 0;
  const goal = group.goal_total || 200;
  const pct = goal > 0 ? Math.min(Math.round((myDays / goal) * 100), 100) : 0;

  const isFinished = group.status === "finished";
  const daysLeft =
    !isFinished && group.end_date
      ? Math.max(0, differenceInDays(parseISO(group.end_date), new Date()))
      : null;

  // Compute user ranking position
  const rankPosition = (() => {
    if (!checkins || !user) return null;
    const userDays: Record<string, number> = {};
    checkins.forEach((c: any) => {
      userDays[c.user_id] = (userDays[c.user_id] || 0) + 1;
    });
    const sorted = Object.entries(userDays).sort(([, a], [, b]) => b - a);
    const idx = sorted.findIndex(([uid]) => uid === user.id);
    return idx >= 0 ? idx + 1 : null;
  })();

  return (
    <button
      onClick={onOpen}
      className={`w-full text-left rounded-2xl surface-1 border p-3.5 transition-all active:scale-[0.98] ${
        isActive ? "border-primary/30 bg-primary/[0.03]" : "border-subtle"
      }`}
    >
      {/* Line 1: Name + (status chip + members) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Trophy className="h-4 w-4 text-primary shrink-0" />
          <h3 className="text-[14px] font-bold truncate">{group.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {(isActive || isFinished) && (
            <span
              className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                isFinished
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isFinished ? "Concluído" : "Ativo"}
            </span>
          )}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{members?.length ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Line 2: Period + Days left */}
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        {group.start_date && group.end_date && (
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(new Date(group.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(group.end_date), "dd MMM", { locale: ptBR })}
          </span>
        )}
        {daysLeft !== null && (
          <span className="font-medium">{daysLeft}d restantes</span>
        )}
      </div>

      {/* Line 3: Progress + Ranking */}
      <div className="mt-2.5 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">Dias ativos</span>
        <div className="flex items-center gap-2.5">
          {rankPosition && (
            <span className="text-muted-foreground">
              #{rankPosition} no ranking
            </span>
          )}
          <span className="font-bold text-primary">{myDays}/{goal}</span>
        </div>
      </div>

      {/* Line 4: Progress bar */}
      <Progress value={pct} className="h-1.5 mt-1.5" />

      {/* Line 5: Actions */}
      <div className="mt-3 flex items-center gap-2">
        <span className="flex-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          Abrir grupo <ChevronRight className="h-3 w-3" />
        </span>
        {!isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetActive();
            }}
            className="text-[11px] font-bold text-primary bg-primary/8 rounded-lg px-3 py-1.5 hover:bg-primary/15 transition-colors"
          >
            Tornar ativo
          </button>
        )}
      </div>
    </button>
  );
};

const GroupList = () => {
  const { data: groups, isLoading } = useUserGroups();
  const { activeGroupId, setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();

  const handleOpen = (id: string) => {
    navigate(`/grupos/${id}/detalhes`);
  };

  const handleSetActive = (id: string, name: string) => {
    setActiveGroupId(id);
    toast.success(`"${name}" agora é o grupo ativo`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <AppScaffold title="Grupos" subtitle="Seus grupos de treino">
        <EmptyState
          image={logo}
          title="Nenhum grupo ainda"
          description="Crie ou entre em um grupo para treinar com amigos."
        >
          <Button onClick={() => navigate("/grupos/criar")} size="lg" className="h-14 w-full rounded-[18px] text-body font-bold glow-primary">
            <Plus className="mr-2 h-5 w-5" /> Criar grupo
          </Button>
          <Button onClick={() => navigate("/grupos/entrar")} variant="outline" size="lg" className="h-14 w-full rounded-[18px] text-body font-bold border-subtle bg-surface-1">
            <LogIn className="mr-2 h-5 w-5" /> Entrar com convite
          </Button>
        </EmptyState>
      </AppScaffold>
    );
  }

  return (
    <AppScaffold
      title="Grupos"
      subtitle="Seus grupos de treino"
      headerRight={
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="rounded-2xl" onClick={() => navigate("/grupos/entrar")}>
            <LogIn className="h-4 w-4" />
          </Button>
          <Button size="sm" className="rounded-2xl" onClick={() => navigate("/grupos/criar")}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      {groups.map((g) => (
        <GroupCard
          key={g.id}
          group={g}
          isActive={g.id === activeGroupId}
          onOpen={() => handleOpen(g.id)}
          onSetActive={() => handleSetActive(g.id, g.name)}
        />
      ))}
    </AppScaffold>
  );
};

export default GroupList;
