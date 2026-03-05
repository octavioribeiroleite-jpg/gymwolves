import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import logo from "@/assets/logo.png";

interface AppScaffoldProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  headerRight?: ReactNode;
  hideNav?: boolean;
  showLogo?: boolean;
}

const AppScaffold = ({ children, title, subtitle, showBack, headerRight, hideNav, showLogo }: AppScaffoldProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-subtle bg-background/95 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          {showLogo && (
            <div className="flex items-center gap-2 mb-1">
              <img src={logo} alt="GYM WOLVES" className="h-7 w-7 object-contain" />
              <span className="text-caption font-bold uppercase tracking-[0.15em] text-primary">GYM WOLVES</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {showBack && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-2xl" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-h1 truncate">{title}</h1>
              {subtitle && <p className="text-subtitle text-muted-foreground truncate mt-0.5">{subtitle}</p>}
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-4 px-5 py-4">
        {children}
      </div>

      {!hideNav && <BottomNav />}
    </div>
  );
};

export default AppScaffold;
