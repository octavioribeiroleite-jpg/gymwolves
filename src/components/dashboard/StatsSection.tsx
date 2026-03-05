import { Flame, Target, Trophy } from "lucide-react";
import StatCard from "@/components/ds/StatCard";

interface StatsSectionProps {
  streak: number;
  daysActive: number;
  record: number;
}

const StatsSection = ({ streak, daysActive, record }: StatsSectionProps) => {
  return (
    <div>
      <h2 className="text-[15px] font-bold mb-3">Seu desempenho</h2>
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Flame} value={streak} label="Sequência" />
        <StatCard icon={Target} value={daysActive} label="Dias ativos" />
        <StatCard icon={Trophy} value={record} label="Recorde" />
      </div>
    </div>
  );
};

export default StatsSection;
