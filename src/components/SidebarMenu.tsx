import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail } from "@/hooks/useGroupData";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Trophy,
  Users,
  Plus,
  LogIn,
  CheckCircle,
  Settings,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useState } from "react";

const SidebarMenu = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { activeGroupId } = useActiveGroup();
  const { data: group } = useGroupDetail(activeGroupId || undefined);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const initials = (profile?.display_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    ...(group
      ? [{ icon: Trophy, label: group.name, action: () => go(`/grupos/${group.id}/detalhes`), highlight: true }]
      : []),
    { icon: Users, label: "Matilha", action: () => go("/grupos") },
    { icon: Plus, label: "Criar grupo", action: () => go("/grupos/criar") },
    { icon: LogIn, label: "Juntar-se ao grupo", action: () => go("/grupos/entrar") },
    { icon: CheckCircle, label: "Desafios concluídos", action: () => go("/desafios-concluidos") },
    { icon: Smartphone, label: "Meus dispositivos", action: () => go("/dispositivos") },
    { icon: Settings, label: "Configurações", action: () => go("/perfil") },
    { icon: HelpCircle, label: "Ajuda & feedback", action: () => {} },
    { icon: Info, label: "Sobre", action: () => {} },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] border-r border-subtle bg-background p-0">
        {/* Header */}
        <div className="border-b border-subtle p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-body font-bold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body font-bold truncate">{profile?.display_name || "Sem nome"}</p>
              <p className="text-small text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="flex-1 py-2">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-1 active:bg-surface-2"
            >
              <item.icon className={`h-5 w-5 ${item.highlight ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`flex-1 text-body ${item.highlight ? "font-bold text-primary" : "font-medium"}`}>
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-subtle p-4">
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="flex w-full items-center gap-4 rounded-[16px] px-4 py-3 text-left transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="text-body font-medium text-destructive">Sair da conta</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
