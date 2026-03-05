import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Zap, Smartphone, Wifi, Share, PlusSquare } from "lucide-react";
import logo from "@/assets/logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEYS = {
  installed: "gymwoves_pwa_installed",
  snoozedAt: "gymwoves_pwa_snoozed_at",
};
const SESSION_KEY = "gymwoves_pwa_dismiss_count";
const SNOOZE_DURATION = 24 * 60 * 60 * 1000; // 24h
const REAPPEAR_DELAY = 4 * 60 * 1000; // 4min
const MAX_DISMISSALS = 3;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function getSessionDismissCount(): number {
  return parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10);
}

function setSessionDismissCount(n: number) {
  sessionStorage.setItem(SESSION_KEY, String(n));
}

export default function PwaInstallPrompt() {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldShow = useCallback(() => {
    if (isStandalone()) return false;
    if (localStorage.getItem(STORAGE_KEYS.installed) === "true") return false;
    const snoozedAt = localStorage.getItem(STORAGE_KEYS.snoozedAt);
    if (snoozedAt && Date.now() - parseInt(snoozedAt, 10) < SNOOZE_DURATION) return false;
    if (getSessionDismissCount() >= MAX_DISMISSALS) return false;
    return true;
  }, []);

  const scheduleReappear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (shouldShow()) setOpen(true);
    }, REAPPEAR_DELAY);
  }, [shouldShow]);

  // Capture beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Initial show — shorter delay for better UX
  useEffect(() => {
    const t = setTimeout(() => {
      if (shouldShow()) {
        setOpen(true);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [shouldShow]);

  // Cleanup timer
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleInstall = async () => {
    setPressing(true);
    setTimeout(() => setPressing(false), 200);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem(STORAGE_KEYS.installed, "true");
        if (timerRef.current) clearTimeout(timerRef.current);
        setOpen(false);
        return;
      }
    }
    // iOS "ENTENDI" — just close
    handleDismiss();
  };

  const handleSnooze = () => {
    localStorage.setItem(STORAGE_KEYS.snoozedAt, String(Date.now()));
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  };

  const handleDismiss = () => {
    const count = getSessionDismissCount() + 1;
    setSessionDismissCount(count);
    setOpen(false);
    if (count < MAX_DISMISSALS) scheduleReappear();
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 80) handleDismiss();
  };

  const ios = isIos();
  const showNativeInstall = !ios && !!deferredPrompt;

  const chips = [
    { icon: Zap, label: "Mais rápido" },
    { icon: Smartphone, label: "Atalho na tela inicial" },
    { icon: Wifi, label: "Funciona offline" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={handleDismiss}
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-[9999] mx-auto max-w-lg"
          >
            <div
              className="relative rounded-t-[28px] px-6 pb-8 pt-4"
              style={{
                background: "linear-gradient(180deg, #1A2030 0%, #0F1319 100%)",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Drag handle */}
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Logo with glow */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                  className="relative"
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, hsl(142 71% 45% / 0.12) 0%, transparent 70%)",
                      transform: "scale(1.6)",
                    }}
                  />
                  <img
                    src={logo}
                    alt="GYM WOVES"
                    className="relative h-20 w-20 object-contain"
                    style={{ filter: "drop-shadow(0 0 12px hsl(142 71% 45% / 0.25))" }}
                  />
                </motion.div>
              </div>

              {/* Title */}
              <h2
                className="mt-3 text-center text-2xl font-bold uppercase tracking-wide text-foreground"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                Ative o modo matilha
              </h2>

              {/* Subtitle */}
              <p className="mt-1.5 text-center text-sm leading-relaxed text-muted-foreground">
                Instale o <span className="font-semibold text-foreground">GYM WOVES</span> e treine com mais foco.
                Abre mais rápido e fica na sua tela inicial.
              </p>

              {/* Chips */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary"
                    style={{ background: "hsl(142 71% 45% / 0.08)" }}
                  >
                    <chip.icon className="h-3.5 w-3.5" />
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* iOS instructions */}
              {ios && (
                <div className="mt-4 space-y-2.5 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Como instalar no iPhone
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span>
                    <p className="text-sm text-foreground/80">
                      Toque em <Share className="inline h-4 w-4 text-primary" /> <span className="font-medium">Compartilhar</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span>
                    <p className="text-sm text-foreground/80">
                      Toque em <PlusSquare className="inline h-4 w-4 text-primary" /> <span className="font-medium">Adicionar à Tela de Início</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</span>
                    <p className="text-sm text-foreground/80">
                      Confirme em <span className="font-medium">Adicionar</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Install button */}
              <motion.button
                onClick={handleInstall}
                whileTap={{ scale: 0.98 }}
                className="mt-5 h-14 w-full rounded-2xl text-base font-bold uppercase tracking-widest text-white transition-shadow"
                style={{
                  background: pressing
                    ? "hsl(142 71% 50%)"
                    : "#22C55E",
                  boxShadow: "0 0 24px hsl(142 71% 45% / 0.35), 0 4px 12px rgba(0,0,0,0.3)",
                  fontFamily: "'Anton', sans-serif",
                }}
              >
                {showNativeInstall ? "INSTALAR AGORA" : "ENTENDI"}
              </motion.button>

              {/* Snooze */}
              <button
                onClick={handleSnooze}
                className="mt-3 w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Agora não
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
