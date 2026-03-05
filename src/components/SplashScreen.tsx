import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

function Particles({ intense }: { intense?: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: intense ? 24 : 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 60 + Math.random() * 40,
        size: Math.random() * 3 + (intense ? 2 : 1.5),
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 1,
      })),
    [intense]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "hsl(142 71% 45% / 0.5)",
            boxShadow: `0 0 ${p.size * 2}px hsl(142 71% 45% / 0.3)`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.7, 0], y: [0, -40 - Math.random() * 30] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function WolfEyes({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute left-1/2 z-10 flex -translate-x-1/2 gap-14"
      style={{ top: "38%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {[0, 1].map((i) => (
        <motion.div key={i} className="relative">
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 28, height: 16, top: -5, left: -9,
              background: "radial-gradient(ellipse, hsl(142 71% 45% / 0.35) 0%, transparent 70%)",
            }}
            animate={visible ? { scale: [1, 1.3, 1, 1.2, 1] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{
              width: 12, height: 7, borderRadius: "50%",
              background: "#22C55E",
              boxShadow: "0 0 14px 5px hsl(142 71% 45% / 0.6), 0 0 40px 10px hsl(142 71% 45% / 0.25)",
            }}
            animate={visible ? { scale: [0.98, 1.02, 0.98] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}



export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState(0);
  // 0: eyes appear, 1: face fades → logo, 2: fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 3200);
    const t3 = setTimeout(() => onFinish(), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const showFace = phase < 1;
  const showLogo = phase >= 1 && phase < 2;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "hsl(218 50% 7%)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 2 ? 0 : 1, y: phase === 2 ? -8 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Ambient glow */}
        <motion.div
          className="pointer-events-none absolute"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, hsl(142 71% 45% / 0.08) 0%, transparent 60%)",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.3 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />

        <Particles intense={phase >= 2} />

        {/* Wolf face */}
        <WolfEyes visible={phase >= 0 && phase < 1} />
        

        {/* Logo reveal */}
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: showLogo ? 1 : 0,
            scale: showLogo ? [0.85, 1.02, 1.0] : 0.85,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid hsl(142 71% 45% / 0.3)",
              boxShadow: "0 0 20px hsl(142 71% 45% / 0.15), inset 0 0 20px hsl(142 71% 45% / 0.08)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={showLogo ? { opacity: [0, 0.6, 0], scale: [0.8, 1.4, 1.8] } : {}}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          />
          <img
            src={logo}
            alt="GYM WOLVES"
            className="relative h-40 w-40 object-contain"
            style={{ filter: "drop-shadow(0 0 20px hsl(142 71% 45% / 0.25))" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="relative z-20 mt-4 text-[36px] font-bold uppercase tracking-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: showLogo ? 1 : 0, y: showLogo ? 0 : 16 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        >
          GYM WOLVES
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="relative z-20 mt-2 text-caption font-medium uppercase tracking-[0.25em] text-primary"
          style={{ textShadow: "0 0 16px hsl(142 71% 45% / 0.4)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: showLogo ? 1 : 0, y: showLogo ? 0 : 8 }}
          transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
        >
          Ative o modo matilha
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
