import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 3 + 3,
        delay: Math.random() * 1.5,
      })),
    []
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
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -30 - Math.random() * 20],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function WolfEyes() {
  return (
    <motion.div
      className="absolute left-1/2 top-[38%] z-10 flex -translate-x-1/2 -translate-y-1/2 gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.6, times: [0, 0.2, 0.7, 1], delay: 0.3 }}
    >
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: 10,
            height: 6,
            background: "#22C55E",
            boxShadow:
              "0 0 16px 6px hsl(142 71% 45% / 0.6), 0 0 40px 12px hsl(142 71% 45% / 0.2)",
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            duration: 0.8,
            repeat: 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"playing" | "fading">("playing");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), 2600);
    const doneTimer = setTimeout(() => onFinish(), 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase !== "fading" ? null : null}
      <motion.div
        key="splash"
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#000" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "fading" ? 0 : 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Central glow */}
        <motion.div
          className="pointer-events-none absolute"
          style={{
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, hsl(142 71% 45% / 0.12) 0%, transparent 60%)",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        <Particles />
        <WolfEyes />

        {/* Logo */}
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: [0.7, 1.08, 1.0] }}
          transition={{
            delay: 0.8,
            duration: 0.7,
            times: [0, 0.6, 1],
            ease: "easeOut",
          }}
        >
          {/* Energy ring sweep */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid hsl(142 71% 45% / 0.4)",
              boxShadow:
                "0 0 20px hsl(142 71% 45% / 0.2), inset 0 0 20px hsl(142 71% 45% / 0.1)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.4, 1.8] }}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
          />
          <img
            src={logo}
            alt="GYM WOVES"
            className="relative h-44 w-44 object-contain"
            style={{
              filter: "drop-shadow(0 0 20px hsl(142 71% 45% / 0.3))",
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="relative z-20 mt-4 text-4xl font-bold uppercase tracking-[0.06em] text-foreground"
          style={{
            fontFamily: "'Anton', sans-serif",
            textShadow:
              "0 0 24px hsl(142 71% 45% / 0.3), 0 2px 6px rgba(0,0,0,0.6)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5, ease: "easeOut" }}
        >
          GYM WOVES
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="relative z-20 mt-2 text-sm font-medium uppercase tracking-[0.25em] text-primary"
          style={{
            textShadow: "0 0 16px hsl(142 71% 45% / 0.4)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5, ease: "easeOut" }}
        >
          Ative o modo matilha
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
