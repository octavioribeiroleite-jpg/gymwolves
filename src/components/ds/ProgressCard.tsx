import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  label: string;
  current: number;
  total: number;
}

const ProgressCard = ({ label, current, total }: ProgressCardProps) => {
  const pct = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className="rounded-[20px] surface-1 border border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-h2">{label}</span>
        <span className="text-body font-bold text-primary">{current}/{total}</span>
      </div>
      <Progress value={pct} className="h-2.5" />
      <p className="mt-2 text-right text-caption text-muted-foreground">{pct}% concluído</p>
    </div>
  );
};

export default ProgressCard;
