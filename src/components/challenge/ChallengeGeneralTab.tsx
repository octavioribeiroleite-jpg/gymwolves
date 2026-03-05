import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Copy, Flame, Share2, Trophy, Settings } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import StatCard from "@/components/ds/StatCard";
import EditGroupDialog from "@/components/EditGroupDialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const SCORING_LABELS: Record<string, string> = {
  days_active: "Dias ativos",
  checkin_count: "Check-ins",
  duration: "Duração",
  distance: "Distância",
  steps: "Passos",
  calories: "Calorias",
  custom_points: "Pontos",
};

interface Props {
  group: any;
  groupId: string;
}

const ChallengeGeneralTab = ({ group, groupId }: Props) => {
  const { user } = useAuth();
  const { data: members } = useGroupMembers(groupId);
  const { data: checkins } = useGroupCheckins(groupId);
  const [editOpen, setEditOpen] = useState(false);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const isAdmin = !!group && !!user && group.created_by === user.id;
  const scoringMode = group?.scoring_mode || "days_active";

  const ranked = useMemo(() => {
    if (!members || !checkins || !group) return [];
    const items = members.map((m: any) => {
      const profile = m.profiles as any;
      const userCheckins = checkins.filter((c: any) => c.user_id === m.user_id);
      let score = 0;
      let scoreLabel = "";

      switch (scoringMode) {
        case "checkin_count":
          score = userCheckins.length;
          scoreLabel = `${score} check-ins`;
          break;
        case "duration":
          score = userCheckins.reduce((sum: number, c: any) => sum + (c.duration_min || 0), 0);
          scoreLabel = `${Math.floor(score / 60)}h ${score % 60}min`;
          break;
        case "distance":
          score = userCheckins.reduce((sum: number, c: any) => sum + (Number(c.distance_km) || 0), 0);
          scoreLabel = `${score.toFixed(1)} km`;
          break;
        case "steps":
          score = userCheckins.reduce((sum: number, c: any) => sum + (c.steps || 0), 0);
          scoreLabel = `${score.toLocaleString()} passos`;
          break;
        case "calories":
          score = userCheckins.reduce((sum: number, c: any) => sum + (c.calories || 0), 0);
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

    items.sort((a: any, b: any) => b.score - a.score || b.current - a.current);
    let rank = 1;
    return items.map((item: any, i: number) => {
      if (i > 0 && item.score < items[i - 1].score) rank = i + 1;
      return { ...item, rank };
    });
  }, [members, checkins, group, scoringMode]);

  const hasMore = ranked.length > 5;
  const displayRanked = showFullRanking ? ranked : ranked.slice(0, 5);

  const totalDays = useMemo(() => {
    if (!group?.start_date || !group?.end_date) return null;
    return differenceInDays(new Date(group.end_date), new Date(group.start_date));
  }, [group?.start_date, group?.end_date]);

  const daysPassed = useMemo(() => {
    if (!group?.start_date) return 0;
    return Math.max(0, differenceInDays(new Date(), new Date(group.start_date)));
  }, [group?.start_date]);

  const timePct = totalDays && totalDays > 0 ? Math.min(Math.round((daysPassed / totalDays) * 100), 100) : 0;

  const myStats = useMemo(() => {
    if (!checkins || !user) return { daysActive: 0, streak: 0, record: 0 };
    const days = computeDaysActive(checkins, user.id);
    const streaks = computeStreaks(checkins, user.id);
    return { daysActive: days, streak: streaks.current, record: streaks.best };
  }, [checkins, user]);

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
          text: `Entre no desafio "${group.name}"! Código: ${group.invite_code}\nBaixe o app: https://gymwolves.lovable.app`,
        });
      } catch { /* cancelled */ }
    } else {
      copyCode();
    }
  };

  const getMedalIcon = (r: number) => {
    if (r === 1) return "🥇";
    if (r === 2) return "🥈";
    if (r === 3) return "🥉";
    return null;
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
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
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} className="shrink-0 rounded-xl">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        {group?.start_date && group?.end_date && (
          <>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(new Date(group.start_date), "dd MMM", { locale: ptBR })} — {format(new Date(group.end_date), "dd MMM yyyy", { locale: ptBR })}
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

      {/* Ranking Top 5 */}
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
            {displayRanked.map((m: any) => {
              const isMe = m.userId === user?.id;
              const medal = getMedalIcon(m.rank);
              return (
                <div
                  key={m.userId}
                  className={`flex items-center gap-3 rounded-[18px] surface-1 border p-4 transition-all ${
                    isMe ? "border-primary/30 ring-1 ring-primary/10" : "border-subtle"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                    {medal ? <span className="text-lg">{medal}</span> : <span className="text-[14px] font-bold text-muted-foreground">{m.rank}</span>}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold text-primary">{getInitials(m.name)}</span>
                    )}
                  </div>
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

            {hasMore && !showFullRanking && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full rounded-[14px] h-10 text-[13px]">
                    Ver ranking completo
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <DrawerHeader>
                    <DrawerTitle>Ranking completo</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-6 space-y-2 overflow-y-auto max-h-[70vh]">
                    {ranked.map((m: any) => {
                      const isMe = m.userId === user?.id;
                      const medal = getMedalIcon(m.rank);
                      return (
                        <div
                          key={m.userId}
                          className={`flex items-center gap-3 rounded-[18px] surface-1 border p-3 ${
                            isMe ? "border-primary/30 ring-1 ring-primary/10" : "border-subtle"
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
                            {medal ? <span className="text-sm">{medal}</span> : <span className="text-[12px] font-bold text-muted-foreground">{m.rank}</span>}
                          </div>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-[10px] font-bold text-primary">{getInitials(m.name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-bold truncate block">
                              {m.name}
                              {isMe && <span className="ml-1 text-[10px] text-primary">(você)</span>}
                            </span>
                          </div>
                          <span className="text-[13px] font-bold text-primary shrink-0">{m.scoreLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        )}
      </div>

      {/* My stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={Flame} value={myStats.streak} label="Sequência" />
        <StatCard icon={CalendarDays} value={myStats.daysActive} label="Dias ativos" />
        <StatCard icon={Trophy} value={myStats.record} label="Recorde" />
      </div>

      {isAdmin && <EditGroupDialog open={editOpen} onOpenChange={setEditOpen} group={group} />}
    </div>
  );
};

export default ChallengeGeneralTab;
