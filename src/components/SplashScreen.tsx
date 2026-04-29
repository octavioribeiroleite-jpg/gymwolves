import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const NEON = "#22C55E";

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4,
    dist: 70 + Math.random() * 90,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 0.3,
  }));
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>(0);
  const particles = useMemo(() => generateParticles(18), []);

  useEffect(() => {
    const schedule: [number, Phase][] = [
      [150,  1],  // particles appear
      [550,  2],  // eyes open
      [950,  3],  // eyes pulse + wolf silhouette
      [1400, 4],  // name appears
      [1900, 5],  // tagline appears
      [2600, 6],  // hold
      [2900, 7],  // dissolve out
      [3300, 8],  // done
    ];
    const timers = schedule.map(([ms, p]) => setTimeout(() => setPhase(p as Phase), ms));
    const finish = setTimeout(() => onFinish(), 3400);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase < 8 && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "#0a0a0a" }}
          animate={phase >= 7 ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Background radial glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.08) 0%, transparent 70%)",
            }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          />

          {/* Particles */}
          <svg
            className="absolute"
            width="320"
            height="320"
            viewBox="-160 -160 320 320"
            style={{ overflow: "visible" }}
          >
            {particles.map((p) => {
              const visible = phase >= 1 && phase <= 6;
              const converging = phase === 1;
              const dissolving = phase >= 6;
              const cx = converging
                ? Math.cos(p.angle) * p.dist
                : dissolving
                ? Math.cos(p.angle) * p.dist * 2.5
                : Math.cos(p.angle) * 18;
              const cy = converging
                ? Math.sin(p.angle) * p.dist
                : dissolving
                ? Math.sin(p.angle) * p.dist * 2.5
                : Math.sin(p.angle) * 18;

              return (
                <motion.circle
                  key={p.id}
                  r={p.size}
                  fill={NEON}
                  initial={{ cx: Math.cos(p.angle) * p.dist, cy: Math.sin(p.angle) * p.dist, opacity: 0 }}
                  animate={{
                    cx,
                    cy,
                    opacity: visible ? [0, 0.9, 0.7] : 0,
                  }}
                  transition={{
                    duration: converging ? 0.5 : dissolving ? 0.5 : 0.4,
                    delay: p.delay,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </svg>

          {/* Center content */}
          <div className="relative flex flex-col items-center gap-0">
            {/* Wolf eyes */}
            <div className="relative flex items-center justify-center mb-2" style={{ height: 56 }}>
              {/* Left eye */}
              <motion.div
                className="absolute"
                style={{ left: -28, top: 0 }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{
                  opacity: phase >= 2 && phase <= 6 ? 1 : 0,
                  scaleY: phase === 2 ? [0, 1.4, 1] : phase >= 3 && phase <= 5 ? 1.1 : phase >= 6 ? 0 : 1,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {/* Glow */}
                <div
                  style={{
                    width: 22,
                    height: 32,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${NEON}55 0%, transparent 70%)`,
                    position: "absolute",
                    inset: -8,
                  }}
                />
                {/* Eye shape */}
                <div
                  style={{
                    width: 22,
                    height: 32,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse at 40% 35%, #fff 0%, ${NEON} 40%, #166534 100%)`,
                    boxShadow: `0 0 12px ${NEON}, 0 0 24px ${NEON}88`,
                  }}
                />
              </motion.div>

              {/* Right eye */}
              <motion.div
                className="absolute"
                style={{ right: -28, top: 0 }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{
                  opacity: phase >= 2 && phase <= 6 ? 1 : 0,
                  scaleY: phase === 2 ? [0, 1.4, 1] : phase >= 3 && phase <= 5 ? 1.1 : phase >= 6 ? 0 : 1,
                }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
              >
                <div
                  style={{
                    width: 22,
                    height: 32,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${NEON}55 0%, transparent 70%)`,
                    position: "absolute",
                    inset: -8,
                  }}
                />
                <div
                  style={{
                    width: 22,
                    height: 32,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse at 40% 35%, #fff 0%, ${NEON} 40%, #166534 100%)`,
                    boxShadow: `0 0 12px ${NEON}, 0 0 24px ${NEON}88`,
                  }}
                />
              </motion.div>
            </div>

            {/* App name */}
            <motion.div
              className="flex items-baseline gap-0 select-none"
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: phase >= 4 ? 1 : 0,
                y: phase >= 4 ? 0 : 16,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: 38,
                  letterSpacing: "-1px",
                  color: "#ffffff",
                  textShadow: `0 0 20px ${NEON}44`,
                }}
              >
                Gym
              </span>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: 38,
                  letterSpacing: "-1px",
                  color: NEON,
                  textShadow: `0 0 20px ${NEON}`,
                }}
              >
                Wolves
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: phase >= 5 ? 0.6 : 0,
                y: phase >= 5 ? 0 : 8,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                color: "#ffffff",
                fontSize: 12,
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              Treine · Compita · Domine
            </motion.p>

            {/* Bottom bar */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: phase >= 5 ? 1 : 0,
                opacity: phase >= 5 && phase < 7 ? 1 : 0,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                marginTop: 20,
                height: 2,
                width: 80,
                borderRadius: 2,
                background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`,
                transformOrigin: "center",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
