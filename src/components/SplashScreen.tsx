import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 60 + Math.random() * 40,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 3 + 3,
        delay: Math.random() * 1,
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
          animate={{ opacity: [0, 0.7, 0], y: [0, -40 - Math.random() * 30] }}
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
      className="absolute left-1/2 top-[42%] z-10 flex -translate-x-1/2 -translate-y-1/2 gap-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 1, 0] }}
      transition={{ duration: 2.0, times: [0, 0.1, 0.6, 0.85, 1], delay: 0.4 }}
    >
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="relative"
        >
          {/* Outer glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 28,
              height: 16,
              top: -5,
              left: -9,
              background: "radial-gradient(ellipse, hsl(142 71% 45% / 0.35) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.2, repeat: 2, ease: "easeInOut" }}
          />
          {/* Eye */}
          <motion.div
            style={{
              width: 12,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              boxShadow:
                "0 0 14px 5px hsl(142 71% 45% / 0.6), 0 0 40px 10px hsl(142 71% 45% / 0.25), 0 0 60px 20px hsl(142 71% 45% / 0.1)",
            }}
            animate={{ scale: [0.98, 1.02, 0.98] }}
            transition={{
              duration: 1.2,
              repeat: 2,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"playing" | "fading">("playing");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), 3300);
    const doneTimer = setTimeout(() => onFinish(), 3800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#000" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "fading" ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Background fade to dark blue */}
        <motion.div
          className="absolute inset-0"
          style={{ background: "#0B0F14" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Central glow */}
        <motion.div
          className="pointer-events-none absolute"
          style={{
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle, hsl(142 71% 45% / 0.1) 0%, transparent 60%)",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.3 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />

        <Particles />
        <WolfEyes />

        {/* Logo */}
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: [0.7, 1.06, 1.0] }}
          transition={{
            delay: 1.8,
            duration: 0.7,
            times: [0, 0.6, 1],
            ease: "easeOut",
          }}
        >
          {/* Energy ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid hsl(142 71% 45% / 0.4)",
              boxShadow:
                "0 0 20px hsl(142 71% 45% / 0.2), inset 0 0 20px hsl(142 71% 45% / 0.1)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.4, 1.8] }}
            transition={{ delay: 2.2, duration: 0.7, ease: "easeOut" }}
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
          transition={{ delay: 2.6, duration: 0.4, ease: "easeOut" }}
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
          transition={{ delay: 3.0, duration: 0.3, ease: "easeOut" }}
        >
          Ative o modo matilha
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
