import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => {
  return (
    <div className="flex flex-col items-center rounded-2xl surface-1 border border-subtle p-4 min-h-[70px] justify-center card-shadow transition-default">
      <Icon className="mb-1 h-4 w-4 text-primary" strokeWidth={2} />
      <span className="text-[18px] font-bold leading-tight">{value}</span>
      <span className="text-[11px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
};

export default StatCard;
