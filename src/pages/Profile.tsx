import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Button } from "@/components/ui/button";
import { Flame, Target, Trophy, LogOut, Users, ChevronRight, CheckCircle, Smartphone, Settings, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { toast } from "sonner";
import AppScaffold from "@/components/ds/AppScaffold";
import StatCard from "@/components/ds/StatCard";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { activeGroupId } = useActiveGroup();
  const { data: group } = useGroupDetail(activeGroupId || undefined);
  const { data: checkins } = useGroupCheckins(activeGroupId || undefined);
  const navigate = useNavigate();

  const myStats = useMemo(() => {
    if (!checkins || !user || !group) return null;
    const days = computeDaysActive(checkins, user.id);
    const streaks = computeStreaks(checkins, user.id);
    return { days, ...streaks };
  }, [checkins, user, group]);

  const initials = (profile?.display_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const shareApp = async () => {
    const url = "https://gymwolves.lovable.app";
    const text = "Treine com seus amigos no GymWoves! 💪🐺";
    if (navigator.share) {
      try { await navigator.share({ title: "GymWoves", text, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const menuItems = [
    { icon: Users, label: "Meus grupos", sub: group?.name || "Nenhum grupo ativo", to: "/grupos" },
    { icon: Trophy, label: "Ranking", sub: "Ver posição no desafio", to: "/ranking" },
    { icon: CheckCircle, label: "Desafios concluídos", sub: "Histórico de desafios", to: "/desafios-concluidos" },
    { icon: Smartphone, label: "Meus dispositivos", sub: "Conectar apps de fitness", to: "/dispositivos" },
  ];

  return (
    <AppScaffold title="Perfil">
      {/* Avatar + Info */}
      <div className="flex flex-col items-center py-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-[22px] font-bold text-primary">
          {initials}
        </div>
        <h2 className="mt-3 text-h2">{profile?.display_name || "Sem nome"}</h2>
        <p className="text-small text-muted-foreground">{user?.email}</p>
      </div>

      {/* Stats */}
      {myStats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Flame} value={myStats.current} label="Sequência" />
          <StatCard icon={Target} value={myStats.days} label="Dias ativos" />
          <StatCard icon={Trophy} value={myStats.best} label="Recorde" />
        </div>
      )}

      {/* Share app — destaque */}
      <button
        onClick={shareApp}
        className="flex w-full items-center gap-4 rounded-[20px] surface-1 border border-primary/20 bg-primary/5 px-4 py-4 text-left transition-colors hover:bg-primary/10"
      >
        <Share2 className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-primary">Compartilhar o app</p>
          <p className="text-small text-muted-foreground">Convide amigos para treinar</p>
        </div>
        <ChevronRight className="h-4 w-4 text-primary/50 shrink-0" />
      </button>

      {/* Menu list */}
      <div className="rounded-[20px] surface-1 border border-subtle overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-2 ${
              i < menuItems.length - 1 ? "border-b border-subtle" : ""
            }`}
          >
            <item.icon className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium">{item.label}</p>
              <p className="text-small text-muted-foreground truncate">{item.sub}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
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
