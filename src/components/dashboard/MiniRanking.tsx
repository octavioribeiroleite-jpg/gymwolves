import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MiniRankingProps {
  topMembers: { userId: string; name: string; days: number }[];
  currentUserId?: string;
}

const MiniRanking = ({ topMembers, currentUserId }: MiniRankingProps) => {
  const navigate = useNavigate();

  if (topMembers.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];
  const maxDays = topMembers[0]?.days || 1;

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [topMembers[1], topMembers[0], topMembers[2]].filter(Boolean);
  const podiumHeights = ["h-16", "h-24", "h-12"];
  const podiumColors = [
    "from-muted to-muted/60",
    "from-primary/30 to-primary/10",
    "from-muted to-muted/60",
  ];
  const podiumMedals = [medals[1], medals[0], medals[2]];
  const podiumSizes = ["h-12 w-12", "h-16 w-16", "h-11 w-11"];
  const podiumTextSizes = ["text-[13px]", "text-[16px]", "text-[12px]"];

  const restMembers = topMembers.slice(3);
  const currentInTop3 = topMembers.slice(0, 3).some((m) => m.userId === currentUserId);
  const currentMember = !currentInTop3
    ? topMembers.find((m) => m.userId === currentUserId)
    : null;
  const currentIndex = currentMember
    ? topMembers.findIndex((m) => m.userId === currentUserId)
    : -1;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="rounded-[18px] surface-1 border border-subtle p-4">
      <div className="flex items-center justify-between mb-4">
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

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-5">
        {podiumOrder.map((m, i) => {
          if (!m) return null;
          const isMe = m.userId === currentUserId;
          const originalIndex = topMembers.indexOf(m);
          return (
            <div key={m.userId} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="relative">
                <Avatar className={`${podiumSizes[i]} border-2 ${isMe ? "border-primary" : "border-subtle"}`}>
                  <AvatarFallback className={`${podiumTextSizes[i]} font-bold bg-secondary text-foreground`}>
                    {getInitials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 text-[14px]">
                  {podiumMedals[i]}
                </span>
              </div>
              <span className={`text-[11px] font-medium text-center truncate max-w-[72px] ${isMe ? "text-primary" : "text-foreground"}`}>
                {m.name.split(" ")[0]}
              </span>
              <span className="text-[13px] font-bold text-primary">{m.days} dias</span>
              <div className={`w-full rounded-t-lg bg-gradient-to-t ${podiumColors[i]} ${podiumHeights[i]}`} />
            </div>
          );
        })}
      </div>

      {/* Rest of members */}
      {restMembers.length > 0 && (
        <div className="space-y-2">
          {restMembers.map((m, i) => {
            const isMe = m.userId === currentUserId;
            const position = i + 4;
            const pct = maxDays > 0 ? Math.round((m.days / maxDays) * 100) : 0;
            return (
              <div
                key={m.userId}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                  isMe ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
                }`}
              >
                <span className="text-[12px] font-bold text-muted-foreground w-5 text-center">
                  #{position}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[11px] font-bold bg-secondary text-foreground">
                    {getInitials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium truncate block">
                    {m.name}
                    {isMe && <span className="ml-1 text-[11px] text-primary">(você)</span>}
                  </span>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[13px] font-bold text-primary whitespace-nowrap">{m.days} dias</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Current user highlight if not in top */}
      {currentMember && currentIndex >= 3 && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 bg-primary/10 border border-primary/20">
          <span className="text-[12px] font-bold text-primary w-5 text-center">
            #{currentIndex + 1}
          </span>
          <Avatar className="h-8 w-8 border-2 border-primary">
            <AvatarFallback className="text-[11px] font-bold bg-secondary text-foreground">
              {getInitials(currentMember.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-medium truncate block text-primary">
              {currentMember.name} (você)
            </span>
          </div>
          <span className="text-[13px] font-bold text-primary whitespace-nowrap">
            {currentMember.days} dias
          </span>
        </div>
      )}
    </div>
  );
};

export default MiniRanking;
