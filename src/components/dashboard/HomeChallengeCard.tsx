import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Shield, Users, Clock, Flame } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks } from "@/hooks/useCheckins";
import { differenceInDays } from "date-fns";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";

interface HomeChallengeCardProps {
  group: any;
  userId: string;
}

const medals = ["🥇", "🥈", "🥉"];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const HomeChallengeCard = ({ group, userId }: HomeChallengeCardProps) => {
  const navigate = useNavigate();
  const { setActiveGroupId } = useActiveGroup();
  const { data: members } = useGroupMembers(group.id);
  const { data: checkins } = useGroupCheckins(group.id);

  const myDays = useMemo(
    () => (checkins ? computeDaysActive(checkins, userId) : 0),
    [checkins, userId]
  );

  const myStreak = useMemo(
    () => (checkins ? computeStreaks(checkins, userId) : { current: 0, best: 0 }),
    [checkins, userId]
  );

  const goal = group.goal_total || 200;
  const pct = goal > 0 ? Math.min(Math.round((myDays / goal) * 100), 100) : 0;

  const daysRemaining = useMemo(() => {
    if (!group.end_date) return null;
    return Math.max(0, differenceInDays(new Date(group.end_date), new Date()));
  }, [group.end_date]);

  const top3 = useMemo(() => {
    if (!members || !checkins) return [];
    return members
      .map((m) => {
        const p = m.profiles as any;
        const days = computeDaysActive(checkins, m.user_id);
        return {
          userId: m.user_id,
          name: p?.display_name || "Sem nome",
          days,
        };
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 3);
  }, [members, checkins]);

  const handleClick = () => {
    setActiveGroupId(group.id);
    navigate(`/grupos/${group.id}/detalhes`);
  };

  const isChallenge = group.type === "challenge";
  const memberCount = members?.length || 0;

  return (
    <button
      onClick={handleClick}
      className="w-full text-left rounded-[18px] surface-1 border border-subtle p-4 transition-all hover:border-primary/20 active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            {isChallenge ? (
              <Trophy className="h-4 w-4 text-primary" />
            ) : (
              <Shield className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className="text-[15px] font-bold truncate">{group.name}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground shrink-0">
          <Users className="h-3.5 w-3.5" />
          <span className="text-[12px]">{memberCount}</span>
        </div>
      </div>

      {/* Mini ranking top 3 */}
      {top3.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          {top3.map((m, i) => (
            <div
              key={m.userId}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] ${
                m.userId === userId
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-secondary text-foreground"
              }`}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px] font-bold bg-secondary text-foreground">
                  {getInitials(m.name)}
                </AvatarFallback>
              </Avatar>
              <span>{medals[i]}</span>
              <span className="truncate max-w-[60px]">{m.name.split(" ")[0]}</span>
              <span className="font-bold">{m.days}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] text-muted-foreground">Meu progresso</span>
          <span className="text-[12px] font-bold text-primary">
            {myDays}/{goal} dias
          </span>
        </div>
        <Progress value={pct} className="h-[6px]" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Flame className="h-3 w-3" />
          <span>{myStreak.current} dias seguidos</span>
        </div>
        {daysRemaining !== null && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{daysRemaining} dias restantes</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default HomeChallengeCard;
