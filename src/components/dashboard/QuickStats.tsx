import { Flame, Target, Trophy } from "lucide-react";

interface QuickStatsProps {
  streak: number;
  daysActive: number;
  record: number;
}

const QuickStats = ({ streak, daysActive, record }: QuickStatsProps) => {
  const items = [
    { icon: Flame, value: streak, label: "Sequência", color: "text-orange-500" },
    { icon: Target, value: daysActive, label: "Dias ativos", color: "text-primary" },
    { icon: Trophy, value: record, label: "Recorde", color: "text-amber-500" },
  ];

  return (
    <div className="rounded-xl surface-1 border border-subtle card-shadow flex items-center divide-x divide-subtle">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2"
        >
          <item.icon className={`h-3.5 w-3.5 shrink-0 ${item.color}`} strokeWidth={2.2} />
          <span className="text-[14px] font-bold leading-none">{item.value}</span>
          <span className="text-[9px] text-muted-foreground leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
