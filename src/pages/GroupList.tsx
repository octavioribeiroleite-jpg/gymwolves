import { useUserGroups, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive } from "@/hooks/useCheckins";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Plus, LogIn, Users, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import logo from "@/assets/logo.png";
import BottomNav from "@/components/BottomNav";
import AppScaffold from "@/components/ds/AppScaffold";
import EmptyState from "@/components/ds/EmptyState";

const GroupCard = ({ group, onSelect }: { group: any; onSelect: () => void }) => {
  const { user } = useAuth();
  const { data: members } = useGroupMembers(group.id);
  const { data: checkins } = useGroupCheckins(group.id);

  const myDays = checkins && user ? computeDaysActive(checkins, user.id) : 0;
  const goal = group.goal_total || 200;
  const pct = goal > 0 ? Math.min(Math.round((myDays / goal) * 100), 100) : 0;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-[20px] surface-1 border border-subtle p-4 transition-all hover:ring-2 hover:ring-primary/30 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="text-body font-bold">{group.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-caption text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{members?.length ?? 0}</span>
        </div>
      </div>
      {group.start_date && group.end_date && (
        <div className="mt-2 flex items-center gap-1.5 text-caption text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {format(new Date(group.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(group.end_date), "dd MMM yyyy", { locale: ptBR })}
        </div>
      )}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-caption">
          <span className="text-muted-foreground">Dias ativos</span>
          <span className="font-bold text-primary">{myDays}/{goal}</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>
    </button>
  );
};

const GroupList = () => {
  const { data: groups, isLoading } = useUserGroups();
  const { setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    setActiveGroupId(id);
    navigate("/");
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
        <EmptyState
          image={logo}
          title="Crie ou entre em um grupo"
          description="Treine com seus amigos e compita para ver quem treina mais."
        >
          <Button onClick={() => navigate("/grupos/criar")} size="lg" className="h-14 w-full rounded-[18px] text-body font-bold glow-primary">
            <Plus className="mr-2 h-5 w-5" /> Criar grupo
          </Button>
          <Button onClick={() => navigate("/grupos/entrar")} variant="outline" size="lg" className="h-14 w-full rounded-[18px] text-body font-bold border-subtle bg-surface-1">
            <LogIn className="mr-2 h-5 w-5" /> Entrar com convite
          </Button>
        </EmptyState>
        <BottomNav />
      </div>
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
        <GroupCard key={g.id} group={g} onSelect={() => handleSelect(g.id)} />
      ))}
    </AppScaffold>
  );
};

export default GroupList;
