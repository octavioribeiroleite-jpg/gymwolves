import { Flame, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface HomeWelcomeProps {
  streak: number;
  daysActive: number;
  record: number;
}

const stats = [
  { key: "streak", icon: Flame, label: "Sequência", color: "text-orange-500" },
  { key: "days", icon: Target, label: "Dias ativos", color: "text-blue-500" },
  { key: "record", icon: Trophy, label: "Recorde", color: "text-amber-500" },
] as const;

const HomeWelcome = ({ streak, daysActive, record }: HomeWelcomeProps) => {
  const values = { streak, days: daysActive, record };

  return (
    <div>
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Suas métricas</h2>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex flex-col items-center rounded-xl surface-1 border border-subtle py-3 px-2 min-h-[64px] justify-center card-shadow"
          >
            <s.icon className={`mb-1 h-4 w-4 ${s.color}`} strokeWidth={2.2} />
            <span className="text-[17px] font-bold leading-tight">{values[s.key]}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomeWelcome;
