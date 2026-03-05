import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const NEON = "#22C55E";
const BG = "#F3F4F6";

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4,
    dist: 60 + Math.random() * 80,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 0.3,
  }));
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>(0);
  const particles = useMemo(() => generateParticles(14), []);

  useEffect(() => {
    const schedule: [number, Phase][] = [
      [200, 1],
      [600, 2],
      [1000, 3],
      [1600, 4],
      [2100, 5],
      [2500, 6],
      [2700, 7],
    ];
    const timers = schedule.map(([ms, p]) => setTimeout(() => setPhase(p), ms));
    const finish = setTimeout(() => onFinish(), 3000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onFinish]);




  return (
    <AnimatePresence>
      {phase < 7 && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: BG }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Energy particles */}
          {particles.map((p) => {
            const inward = phase >= 1 && phase <= 2;
            const dissolve = phase >= 6;
            const visible = phase >= 1 && phase <= 6;
            const cx = Math.cos(p.angle) * (inward ? 20 : p.dist);
            const cy = Math.sin(p.angle) * (inward ? 20 : p.dist);
            const dcx = Math.cos(p.angle) * (dissolve ? p.dist * 2 : 0);
            const dcy = Math.sin(p.angle) * (dissolve ? p.dist * 2 : 0);

            return (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: NEON,
                  boxShadow: `0 0 6px ${NEON}`,
                }}
                animate={{
                  x: dissolve ? dcx : cx,
                  y: dissolve ? dcy : cy,
                  opacity: visible ? (dissolve ? 0 : [0.3, 0.8, 0.3]) : 0,
                  scale: dissolve ? 0.2 : 1,
                }}
                transition={{
                  duration: dissolve ? 0.4 : 0.5,
                  delay: dissolve ? 0 : p.delay,
                  ease: "easeInOut",
                  opacity: {
                    duration: dissolve ? 0.3 : 1.2,
                    repeat: dissolve ? 0 : Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
            );
          })}

          {/* Wolf eyes — diffuse glow */}
          <div className="relative z-10 flex items-center gap-12">
            {/* Left eye */}
            <motion.div
              className="relative"
              style={{ width: 60, height: 36 }}
              animate={{
                opacity: phase >= 2 && phase <= 6 ? 1 : 0,
                scaleY: phase === 2 ? [0.1, 1.3, 1] : phase === 3 || phase === 4 ? 1.2 : phase === 5 ? 0.15 : phase >= 6 ? 0 : 1,
                scaleX: phase === 4 ? 1.1 : 1,
              }}
              transition={{
                duration: phase === 2 ? 0.35 : 0.45,
                ease: "easeInOut",
              }}
            >
              {/* Outer glow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(ellipse at center, #22C55E 0%, rgba(34,197,94,0.4) 50%, transparent 80%)",
                  filter: "blur(18px)",
                }}
              />
              {/* Inner bright core */}
              <div
                className="absolute rounded-full"
                style={{
                  top: "15%",
                  left: "20%",
                  width: "60%",
                  height: "70%",
                  background: "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(200,255,200,0.6) 40%, transparent 80%)",
                  filter: "blur(6px)",
                }}
              />
            </motion.div>

            {/* Right eye */}
            <motion.div
              className="relative"
              style={{ width: 60, height: 36 }}
              animate={{
                opacity: phase >= 2 && phase <= 6 ? 1 : 0,
                scaleY: phase === 2 ? [0.1, 1.3, 1] : phase === 3 || phase === 4 ? 1.2 : phase === 5 ? 0.15 : phase >= 6 ? 0 : 1,
                scaleX: phase === 4 ? 1.1 : 1,
              }}
              transition={{
                duration: phase === 2 ? 0.35 : 0.45,
                ease: "easeInOut",
              }}
            >
              {/* Outer glow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(ellipse at center, #22C55E 0%, rgba(34,197,94,0.4) 50%, transparent 80%)",
                  filter: "blur(18px)",
                }}
              />
              {/* Inner bright core */}
              <div
                className="absolute rounded-full"
                style={{
                  top: "15%",
                  left: "20%",
                  width: "60%",
                  height: "70%",
                  background: "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(200,255,200,0.6) 40%, transparent 80%)",
                  filter: "blur(6px)",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
