import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Button } from "@/components/ui/button";
import { Flame, Target, Trophy, LogOut, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import AppScaffold from "@/components/ds/AppScaffold";
import StatCard from "@/components/ds/StatCard";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { activeGroupId } = useActiveGroup();
  const { data: group } = useGroupDetail(activeGroupId || undefined);
  const { data: checkins } = useGroupCheckins(activeGroupId || undefined);

  const myStats = useMemo(() => {
    if (!checkins || !user || !group) return null;
    const days = computeDaysActive(checkins, user.id);
    const streaks = computeStreaks(checkins, user.id);
    const goal = (group as any).goal_total || 200;
    return { days, goal, ...streaks };
  }, [checkins, user, group]);

  const initials = (profile?.display_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppScaffold title="Perfil">
      {/* Avatar + Info */}
      <div className="flex flex-col items-center py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-[22px] font-bold text-primary">
          {initials}
        </div>
        <h2 className="mt-3 text-h2">{profile?.display_name || "Sem nome"}</h2>
        <p className="text-subtitle text-muted-foreground">{user?.email}</p>
      </div>

      {/* Stats */}
      {myStats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Flame} value={myStats.current} label="Sequência" />
          <StatCard icon={Target} value={myStats.days} label="Treinos" />
          <StatCard icon={Trophy} value={myStats.best} label="Recorde" />
        </div>
      )}

      {/* Account links */}
      <div className="rounded-[20px] surface-1 border border-subtle overflow-hidden">
        <Link to="/grupos" className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-2 border-b border-subtle">
          <Users className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-body font-medium">Meus grupos</p>
            <p className="text-caption text-muted-foreground">{group?.name || "Nenhum grupo ativo"}</p>
          </div>
        </Link>
        <Link to="/ranking" className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-2">
          <Trophy className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-body font-medium">Ranking</p>
            <p className="text-caption text-muted-foreground">Ver posição no desafio</p>
          </div>
        </Link>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={signOut}
        className="h-14 w-full rounded-[18px] gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </Button>
    </AppScaffold>
  );
};

export default Profile;
