import { useNavigate } from "react-router-dom";
import { useUserGroups, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive } from "@/hooks/useCheckins";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { Users, ChevronRight } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const MiniGroupCard = ({
  group,
  userId,
  isActive,
  onSetActive,
  onOpen,
}: {
  group: any;
  userId: string;
  isActive: boolean;
  onSetActive: () => void;
  onOpen: () => void;
}) => {
  const { data: members } = useGroupMembers(group.id);
  const { data: checkins } = useGroupCheckins(group.id);
  const myDays = checkins ? computeDaysActive(checkins, userId) : 0;
  const goal = group.goal_total || 200;

  const daysLeft =
    group.end_date
      ? Math.max(0, differenceInDays(parseISO(group.end_date), new Date()))
      : null;

  return (
    <button
      onClick={onOpen}
      className={`shrink-0 w-[200px] rounded-2xl surface-1 border p-3.5 text-left transition-all active:scale-[0.97] ${
        isActive ? "border-primary/30 bg-primary/[0.03]" : "border-subtle"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[13px] font-bold truncate flex-1 mr-2">{group.name}</h4>
        {isActive && (
          <span className="shrink-0 bg-primary/10 text-primary text-[10px] font-bold rounded-full px-2 py-0.5">
            Ativo
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {members?.length ?? 0}
        </span>
        {daysLeft !== null && <span>{daysLeft}d restantes</span>}
      </div>

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">Progresso</span>
        <span className="font-bold text-primary">
          {myDays}/{goal}
        </span>
      </div>

      <div className="mt-1.5 h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min((myDays / goal) * 100, 100)}%` }}
        />
      </div>

      {!isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetActive();
          }}
          className="mt-2.5 w-full text-[11px] font-bold text-primary bg-primary/8 rounded-lg py-1.5 hover:bg-primary/15 transition-colors"
        >
          Tornar ativo
        </button>
      )}
    </button>
  );
};

const HomeGroupsList = () => {
  const { user } = useAuth();
  const { data: groups } = useUserGroups();
  const { activeGroupId, setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();

  if (!groups || groups.length <= 1 || !user) return null;

  // Show non-active groups, limit to 3
  const otherGroups = groups.filter((g) => g.id !== activeGroupId).slice(0, 3);
  const hasMore = groups.length - 1 > 3;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[13px] font-bold">Seus grupos</h2>
        {hasMore && (
          <button
            onClick={() => navigate("/grupos")}
            className="text-[11px] font-bold text-primary flex items-center gap-0.5"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        {otherGroups.map((g) => (
          <MiniGroupCard
            key={g.id}
            group={g}
            userId={user.id}
            isActive={g.id === activeGroupId}
            onSetActive={() => setActiveGroupId(g.id)}
            onOpen={() => navigate(`/grupos/${g.id}/detalhes`)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeGroupsList;
