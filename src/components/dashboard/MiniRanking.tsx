import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MiniRankingProps {
  topMembers: { userId: string; name: string; days: number }[];
  currentUserId?: string;
}

const MiniRanking = ({ topMembers, currentUserId }: MiniRankingProps) => {
  const navigate = useNavigate();

  if (topMembers.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-[18px] surface-1 border border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold">Ranking</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-2xl text-[12px] text-primary px-2"
          onClick={() => navigate("/ranking")}
        >
          Ver completo
        </Button>
      </div>
      <div className="space-y-2">
        {topMembers.map((m, i) => {
          const isMe = m.userId === currentUserId;
          return (
            <div
              key={m.userId}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                isMe ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <span className="text-[13px]">{i < 3 ? medals[i] : `#${i + 1}`}</span>
              </div>
              <span className="flex-1 text-[14px] font-medium truncate">
                {m.name}
                {isMe && <span className="ml-1 text-[12px] text-muted-foreground">(você)</span>}
              </span>
              <span className="text-[14px] font-bold text-primary">{m.days}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniRanking;
