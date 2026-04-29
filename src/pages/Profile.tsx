import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Users, ChevronRight, CheckCircle, Smartphone, Share2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
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
  const [updating, setUpdating] = useState(false);

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
    const text = "Treine com seus amigos no GymWolves! 💪🐺";
    if (navigator.share) {
      try { await navigator.share({ title: "GymWolves", text, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const updateApp = async () => {
    setUpdating(true);
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
      toast.success("App atualizado! Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      toast.error("Erro ao atualizar o app.");
      setUpdating(false);
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
      <div className="flex flex-col items-center gap-2 py-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
          {initials}
        </div>
        <h2 className="text-lg font-bold">{profile?.display_name || "Sem nome"}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Stats */}
      {myStats && (
        <StatCard streak={myStats.streak} daysActive={myStats.days} record={myStats.record} />
      )}

      {/* Share app */}
      <button
        onClick={shareApp}
        className="w-full flex items-center gap-4 px-4 py-4 bg-primary/5 border border-primary/20 rounded-2xl mt-4 hover:bg-primary/10 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Share2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Compartilhar o app</p>
          <p className="text-xs text-muted-foreground">Convide amigos para treinar</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Menu list */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm mt-4 overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => navigate(item.to)}
            className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/50 ${
              i < menuItems.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Atualizar + Logout */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm mt-4 overflow-hidden">
        {/* Atualizar app */}
        <button
          onClick={updateApp}
          disabled={updating}
          className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/50 border-b border-border/50"
        >
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${updating ? "animate-spin" : ""}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{updating ? "Atualizando..." : "Atualizar app"}</p>
            <p className="text-xs text-muted-foreground">Buscar a versão mais recente</p>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-destructive/5"
        >
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Sair da conta</p>
          </div>
        </button>
      </div>

      <div className="h-8" />
    </AppScaffold>
  );
};

export default Profile;
