import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => {
  return (
    <div className="flex flex-col items-center rounded-[20px] surface-1 border border-subtle p-4 min-h-[96px] justify-center">
      <Icon className="mb-1.5 h-5 w-5 text-primary" strokeWidth={2} />
      <span className="text-[22px] font-bold leading-tight">{value}</span>
      <span className="text-caption text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
};

export default StatCard;
