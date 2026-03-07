import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => {
  return (
    <div className="flex flex-col items-center rounded-xl surface-1 border border-subtle py-2.5 px-2 min-h-[56px] justify-center card-shadow transition-default">
      <Icon className="mb-0.5 h-3.5 w-3.5 text-primary" strokeWidth={2} />
      <span className="text-[15px] font-bold leading-tight">{value}</span>
      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
};

export default StatCard;
