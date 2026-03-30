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
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-xl surface-1 border border-subtle px-3 py-2.5 card-shadow"
        >
          <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} strokeWidth={2.2} />
          <div className="min-w-0">
            <span className="text-[16px] font-bold leading-none block">{item.value}</span>
            <span className="text-[9px] text-muted-foreground leading-tight">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
