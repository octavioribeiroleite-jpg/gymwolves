import { Flame, Target, Trophy } from "lucide-react";

interface QuickStatsProps {
  streak: number;
  daysActive: number;
  record: number;
}

const QuickStats = ({ streak, daysActive, record }: QuickStatsProps) => {
  const items = [
    {
      icon: Flame,
      value: streak,
      label: "Sequência",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: Target,
      value: daysActive,
      label: "Dias ativos",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Trophy,
      value: record,
      label: "Recorde",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-card rounded-2xl border border-border/50 shadow-sm px-3 py-3 flex flex-col items-center gap-1.5"
        >
          <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center`}>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          <span className="text-lg font-bold leading-none text-foreground">{item.value}</span>
          <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
