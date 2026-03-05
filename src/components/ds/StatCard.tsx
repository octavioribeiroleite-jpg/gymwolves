import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => {
  return (
    <div className="flex flex-col items-center rounded-[18px] surface-1 border border-subtle p-4 min-h-[110px] justify-center">
      <Icon className="mb-2 h-5 w-5 text-primary" strokeWidth={2} />
      <span className="text-[22px] font-bold leading-tight">{value}</span>
      <span className="text-[12px] text-muted-foreground mt-1">{label}</span>
    </div>
  );
};

export default StatCard;
