import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => {
  return (
    <Card className="border-0">
      <CardContent className="flex flex-col items-center p-4">
        <Icon className="mb-1.5 h-5 w-5 text-primary" />
        <span className="text-2xl font-bold font-display">{value}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
};

export default StatCard;
