import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers, useLeaveGroup } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks, hasCheckedInToday } from "@/hooks/useCheckins";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Copy, Loader2, LogOut, Trophy, Flame, Share2, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import AppScaffold from "@/components/ds/AppScaffold";
import CheckinDialog from "@/components/CheckinDialog";

const SCORING_LABELS: Record<string, string> = {
  days_active: "Dias ativos",
  checkin_count: "Check-ins",
  duration: "Duração",
  distance: "Distância",
  steps: "Passos",
  calories: "Calorias",
  custom_points: "Pontos",
};

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setActiveGroupId } = useActiveGroup();
  const queryClient = useQueryClient();
  const { data: group, isLoading } = useGroupDetail(id);
  const { data: members } = useGroupMembers(id);
  const { data: checkins } = useGroupCheckins(id);
  const leaveGroup = useLeaveGroup();
  const [checkinOpen, setCheckinOpen] = useState(false);

  // Realtime subscription for checkins
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`group-checkins-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `group_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["checkins", id] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  // Also subscribe to member changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`group-members-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_members", filter: `group_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["group-members", id] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  const groupAny = group as any;
  const scoringMode = groupAny?.scoring_mode || "days_active";

  const ranked = useMemo(() => {
    if (!members || !checkins || !group) return [];
    const items = members.map((m) => {
      const profile = m.profiles as any;
      const userCheckins = checkins.filter((c) => c.user_id === m.user_id);
      let score = 0;
      let scoreLabel = "";

      switch (scoringMode) {
        case "checkin_count":
          score = userCheckins.length;
          scoreLabel = `${score} check-ins`;
          break;
        case "duration":
          score = userCheckins.reduce((sum, c) => sum + ((c as any).duration_min || 0), 0);
          scoreLabel = `${Math.floor(score / 60)}h ${score % 60}min`;
          break;
        case "distance":
          score = userCheckins.reduce((sum, c) => sum + (Number((c as any).distance_km) || 0), 0);
          scoreLabel = `${score.toFixed(1)} km`;
          break;
        case "steps":
          score = userCheckins.reduce((sum, c) => sum + ((c as any).steps || 0), 0);
          scoreLabel = `${score.toLocaleString()} passos`;
          break;
        case "calories":
          score = userCheckins.reduce((sum, c) => sum + ((c as any).calories || 0), 0);
          scoreLabel = `${score.toLocaleString()} kcal`;
          break;
        default:
          score = computeDaysActive(checkins, m.user_id);
          scoreLabel = `${score} dias`;
          break;
      }

      const streaks = computeStreaks(checkins, m.user_id);
      return {
        userId: m.user_id,
        name: profile?.display_name || "Sem nome",
        avatarUrl: profile?.avatar_url,
        score,
        scoreLabel,
        ...streaks,
      };
    });

    items.sort((a, b) => b.score - a.score || b.current - a.current);
    let rank = 1;
    return items.map((item, i) => {
      if (i > 0 && item.score < items[i - 1].score) rank = i + 1;
      return { ...item, rank };
    });
  }, [members, checkins, group, scoringMode]);

  const totalDays = useMemo(() => {
    if (!groupAny?.start_date || !groupAny?.end_date) return null;
    return differenceInDays(new Date(groupAny.end_date), new Date(groupAny.start_date));
  }, [groupAny?.start_date, groupAny?.end_date]);

  const daysPassed = useMemo(() => {
    if (!groupAny?.start_date) return 0;
    return Math.max(0, differenceInDays(new Date(), new Date(groupAny.start_date)));
  }, [groupAny?.start_date]);

  const timePct = totalDays && totalDays > 0 ? Math.min(Math.round((daysPassed / totalDays) * 100), 100) : 0;

  const alreadyChecked = useMemo(
    () => (checkins && user ? hasCheckedInToday(checkins, user.id) : false),
    [checkins, user]
  );

  const copyCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      toast.success("Código copiado!");
    }
  };

  const shareCode = async () => {
    if (!group?.invite_code) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: `Entre no desafio "${group.name}"! Código: ${group.invite_code}`,
        });
      } catch { /* cancelled */ }
    } else {
      copyCode();
    }
  };

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

  const getMedalIcon = (r: number) => {
    if (r === 1) return "🥇";
    if (r === 2) return "🥈";
    if (r === 3) return "🥉";
    return null;
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppScaffold title={group?.name || "Desafio"} showBack hideNav>
      {/* Challenge info card */}
      <div className="rounded-[20px] surface-1 border border-subtle p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold truncate">{group?.name}</h2>
            <p className="text-[12px] text-muted-foreground">
              {SCORING_LABELS[scoringMode]} · {members?.length || 0} membros
            </p>
          </div>
        </div>

        {groupAny?.start_date && groupAny?.end_date && (
          <>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(new Date(groupAny.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(groupAny.end_date), "dd MMM yyyy", { locale: ptBR })}
              {totalDays && (
                <span className="ml-auto text-[12px] font-medium text-primary">
                  {totalDays - daysPassed} dias restantes
                </span>
              )}
            </div>
            <div>
              <Progress value={timePct} className="h-[6px]" />
              <p className="mt-1 text-[11px] text-muted-foreground text-right">{timePct}% do tempo</p>
            </div>
          </>
        )}
      </div>

      {/* Invite code */}
      <div className="rounded-[20px] surface-1 border border-subtle p-4">
        <p className="mb-2 text-[12px] text-muted-foreground font-medium">Convide amigos</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-[14px] bg-secondary px-4 py-3 text-center font-mono text-[18px] font-bold tracking-[0.3em] text-primary">
            {group?.invite_code}
          </code>
          <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-[14px] border-subtle bg-secondary">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={shareCode} className="h-12 w-12 rounded-[14px] border-subtle bg-secondary">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Ranking */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[15px] font-bold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Ranking
          </h3>
          <span className="text-[12px] text-muted-foreground">{ranked.length} participantes</span>
        </div>

        {ranked.length === 0 ? (
          <div className="rounded-[20px] surface-1 border border-subtle p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-[14px] text-muted-foreground">Nenhum participante ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranked.map((m) => {
              const isMe = m.userId === user?.id;
              const medal = getMedalIcon(m.rank);
              return (
                <div
                  key={m.userId}
                  className={`flex items-center gap-3 rounded-[18px] surface-1 border p-4 transition-all ${
                    isMe ? "border-primary/30 ring-1 ring-primary/10" : "border-subtle"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                    {medal ? (
                      <span className="text-lg">{medal}</span>
                    ) : (
                      <span className="text-[14px] font-bold text-muted-foreground">{m.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold text-primary">{getInitials(m.name)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold truncate">
                        {m.name}
                        {isMe && <span className="ml-1 text-[11px] text-primary font-medium">(você)</span>}
                      </span>
                      <span className="text-[14px] font-bold text-primary ml-2 shrink-0">{m.scoreLabel}</span>
                    </div>
                    <div className="mt-0.5 flex gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" /> {m.current} seguidos
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Recorde: {m.best}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave button */}
      <Button
        variant="ghost"
        onClick={handleLeave}
        className="h-12 w-full rounded-[16px] text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        disabled={leaveGroup.isPending}
      >
        {leaveGroup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
        Sair do grupo
      </Button>

      {/* FAB Check-in */}
      {id && (
        <>
          <button
            onClick={() => setCheckinOpen(true)}
            className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
          <CheckinDialog
            open={checkinOpen}
            onOpenChange={setCheckinOpen}
            groupId={id}
            alreadyCheckedIn={alreadyChecked}
          />
        </>
      )}
    </AppScaffold>
  );
};

export default GroupDetails;
