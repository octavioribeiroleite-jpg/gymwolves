import { useNavigate } from "react-router-dom";
import { useUserGroups } from "@/hooks/useGroupData";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight } from "lucide-react";
import HomeChallengeCard from "./HomeChallengeCard";

const HomeGroupsList = () => {
  const { user } = useAuth();
  const { data: groups } = useUserGroups();
  const { activeGroupId, setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();

  if (!groups || groups.length <= 1 || !user) return null;

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

      <div className="flex flex-col gap-2.5">
        {otherGroups.map((g) => (
          <div key={g.id} className="relative">
            <HomeChallengeCard group={g} userId={user.id} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveGroupId(g.id);
              }}
              className="absolute bottom-2.5 right-3 text-[11px] font-bold text-primary bg-primary/10 rounded-lg px-3 py-1.5 hover:bg-primary/15 transition-colors z-10"
            >
              Tornar ativo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeGroupsList;
