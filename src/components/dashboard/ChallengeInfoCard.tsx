import { CalendarDays, Crown, User } from "lucide-react";

interface ChallengeInfoCardProps {
  leaderName: string;
  userName: string;
  daysRemaining: number | null;
}

const ChallengeInfoCard = ({ leaderName, userName, daysRemaining }: ChallengeInfoCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-[18px] surface-1 border border-subtle px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Crown className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
          <span className="text-[13px] text-muted-foreground">{leaderName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          </div>
          <span className="text-[13px] text-muted-foreground">{userName}</span>
        </div>
      </div>
      {daysRemaining !== null && (
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-primary">
          <CalendarDays className="h-4 w-4" strokeWidth={2} />
          <span>{daysRemaining} dias</span>
        </div>
      )}
    </div>
  );
};

export default ChallengeInfoCard;
