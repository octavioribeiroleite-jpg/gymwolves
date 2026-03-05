import AppScaffold from "@/components/ds/AppScaffold";
import { ChevronRight, Heart, Watch, Activity } from "lucide-react";

const DEVICES = [
  { name: "Health Connect", icon: Heart },
  { name: "Samsung Health", icon: Activity },
  { name: "Garmin", icon: Watch },
  { name: "Fitbit", icon: Watch },
  { name: "Strava", icon: Activity },
  { name: "Zepp", icon: Watch },
  { name: "Mi Fitness", icon: Activity },
];

const Devices = () => {
  return (
    <AppScaffold title="Meus dispositivos" subtitle="Conecte seus apps de saúde e fitness." showBack>
      <div className="rounded-[20px] surface-1 border border-subtle overflow-hidden">
        {DEVICES.map((device, i) => (
          <button
            key={device.name}
            className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-2 ${
              i < DEVICES.length - 1 ? "border-b border-subtle" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <device.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="flex-1 text-body font-medium">{device.name}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <button className="w-full rounded-[20px] surface-1 border border-subtle p-4 text-center text-small text-muted-foreground transition-colors hover:bg-surface-2">
        Meu dispositivo não está listado aqui
      </button>
    </AppScaffold>
  );
};

export default Devices;
