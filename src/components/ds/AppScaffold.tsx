import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

interface AppScaffoldProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  headerRight?: ReactNode;
  hideNav?: boolean;
}

const AppScaffold = ({ children, title, subtitle, showBack, headerRight, hideNav }: AppScaffoldProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          {showBack && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-2xl" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-title-section truncate">{title}</h1>
            {subtitle && <p className="text-description text-muted-foreground truncate">{subtitle}</p>}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-5 p-4">
        {children}
      </div>

      {!hideNav && <BottomNav />}
    </div>
  );
};

export default AppScaffold;
