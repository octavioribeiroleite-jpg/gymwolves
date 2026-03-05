import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Target, Trophy, LogOut, Users, Settings, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useMemo } from "react";

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
    const pct = goal > 0 ? Math.min(Math.round((days / goal) * 100), 100) : 0;
    return { days, goal, pct, ...streaks };
  }, [checkins, user, group]);

  const initials = (profile?.display_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-xl font-bold">Perfil</h1>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 p-4">
        <div className="flex flex-col items-center py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary font-display">
            {initials}
          </div>
          <h2 className="mt-3 text-lg font-bold font-display">{profile?.display_name || "Sem nome"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

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
                <span className="text-2xl font-bold font-display">{myStats.days}/{myStats.goal}</span>
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

        <Card className="border-0">
          <CardContent className="divide-y divide-border p-0">
            <Link to="/grupos" className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Meus Grupos</p>
                <p className="text-xs text-muted-foreground">{group?.name || "Nenhum grupo ativo"}</p>
              </div>
            </Link>
            <Link to="/ranking" className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary">
              <Trophy className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Ranking</p>
                <p className="text-xs text-muted-foreground">Ver posição no grupo</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={signOut}
          className="h-12 w-full rounded-2xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
