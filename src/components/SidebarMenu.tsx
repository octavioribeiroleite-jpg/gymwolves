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
  FileText,
  MessageCircle,
  Home,
  Calendar,
  User,
  Swords,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import logo from "@/assets/logo.png";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" },
  }),
};

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  action: () => void;
  index: number;
  iconClass?: string;
}

const MenuItem = ({ icon: Icon, label, action, index, iconClass = "text-primary" }: MenuItemProps) => (
  <motion.button
    custom={index}
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    whileTap={{ scale: 0.96 }}
    onClick={action}
    className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-1 active:bg-surface-2"
  >
    <Icon className={`h-5 w-5 ${iconClass}`} />
    <span className="flex-1 text-[14px] font-medium">{label}</span>
    <motion.span whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
    </motion.span>
  </motion.button>
);

const SidebarMenu = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { activeGroupId } = useActiveGroup();
  const { data: group } = useGroupDetail(activeGroupId || undefined);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandalone());

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const onInstalled = () => setIsInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    setOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("gymwolves_pwa_installed", "true");
        setIsInstalled(true);
        toast.success("App instalado com sucesso! 🐺");
      }
    } else if (isIos()) {
      toast("No Safari, toque em Compartilhar → Adicionar à Tela de Início", { duration: 5000 });
    } else {
      toast("No menu do navegador (⋮), selecione \"Instalar aplicativo\"", { duration: 5000 });
    }
  };

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

  const navItems = [
    { icon: Home, label: "Início", action: () => go("/") },
    { icon: Swords, label: "Grupos", action: () => go("/grupos") },
    { icon: Calendar, label: "Histórico", action: () => go("/historico") },
    { icon: Trophy, label: "Ranking", action: () => go("/ranking") },
    { icon: User, label: "Perfil", action: () => go("/perfil") },
  ];

  const challengeItems = group
    ? [
        { icon: FileText, label: "Detalhes", action: () => go(`/grupos/${group.id}/detalhes`) },
        { icon: Trophy, label: "Classificações", action: () => go("/ranking") },
        { icon: MessageCircle, label: "Bate-papo", action: () => {} },
      ]
    : [];

  const shareApp = async () => {
    setOpen(false);
    const url = "https://gymwolves.lovable.app";
    const text = "Treine com seus amigos no GymWoves! 💪🐺";
    if (navigator.share) {
      try { await navigator.share({ title: "GymWoves", text, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const generalItems = [
    { icon: Share2, label: "Compartilhar o app", action: shareApp, highlight: true },
    ...(!isInstalled ? [{ icon: Download, label: "Instalar app", action: handleInstallClick, highlight: true }] : []),
    { icon: Plus, label: "Criar grupo", action: () => go("/grupos/criar") },
    { icon: LogIn, label: "Juntar-se ao grupo", action: () => go("/grupos/entrar") },
    { icon: CheckCircle, label: "Desafios concluídos", action: () => go("/desafios-concluidos") },
    { icon: Smartphone, label: "Meus dispositivos", action: () => go("/dispositivos") },
    { icon: Settings, label: "Configurações", action: () => go("/perfil") },
    { icon: HelpCircle, label: "Ajuda & feedback", action: () => {} },
    { icon: Info, label: "Sobre", action: () => {} },
  ];

  let globalIndex = 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex h-full w-[300px] flex-col border-r border-subtle bg-background p-0">
        {/* Header — fixo */}
        <div className="shrink-0 border-b border-subtle p-5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-body font-bold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body font-bold truncate">{profile?.display_name || "Sem nome"}</p>
              <p className="text-small text-muted-foreground truncate">{user?.email}</p>
            </div>
          </motion.div>
        </div>

        {/* Conteúdo rolável */}
        <ScrollArea className="flex-1">
          {/* Navegação */}
          <div className="py-2 border-b border-subtle">
            <p className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Navegação</p>
            {navItems.map((item, i) => {
              const idx = globalIndex++;
              return (
                <MenuItem key={`nav-${i}`} icon={item.icon} label={item.label} action={item.action} index={idx} />
              );
            })}
          </div>

          {/* Desafio */}
          {challengeItems.length > 0 && (
            <div className="py-2 border-b border-subtle">
              <p className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Grupo ativo</p>
              {challengeItems.map((item, i) => {
                const idx = globalIndex++;
                return (
                  <MenuItem key={`challenge-${i}`} icon={item.icon} label={item.label} action={item.action} index={idx} />
                );
              })}
            </div>
          )}

          {/* Geral */}
          <div className="py-2">
            <p className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Geral</p>
            {generalItems.map((item, i) => {
              const idx = globalIndex++;
              return (
                <MenuItem
                  key={`general-${i}`}
                  icon={item.icon}
                  label={item.label}
                  action={item.action}
                  index={idx}
                  iconClass={(item as any).highlight ? "text-primary" : "text-muted-foreground"}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* Logout — fixo */}
        <div className="shrink-0 border-t border-subtle p-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { setOpen(false); signOut(); }}
            className="flex w-full items-center gap-4 rounded-[16px] px-4 py-3 text-left transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="text-body font-medium text-destructive">Sair da conta</span>
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
