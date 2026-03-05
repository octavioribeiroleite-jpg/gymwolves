import { Progress } from "@/components/ui/progress";

interface ProgressSectionProps {
  current: number;
  total: number;
}

const ProgressSection = ({ current, total }: ProgressSectionProps) => {
  const pct = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className="rounded-[18px] surface-1 border border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[15px] font-bold">Meu progresso</span>
        <span className="text-[15px] font-bold text-primary">{current}/{total}</span>
      </div>
      <Progress value={pct} className="h-[10px]" />
      <p className="mt-2 text-right text-[12px] text-muted-foreground">{pct}% concluído</p>
    </div>
  );
};

export default ProgressSection;
