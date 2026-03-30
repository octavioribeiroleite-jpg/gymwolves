import { ReactNode, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const THRESHOLD = 80;

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDistance = useMotionValue(0);

  const spinnerOpacity = useTransform(pullDistance, [0, THRESHOLD * 0.5, THRESHOLD], [0, 0.5, 1]);
  const spinnerScale = useTransform(pullDistance, [0, THRESHOLD], [0.5, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    // Apply resistance
    const distance = Math.min(delta * 0.4, THRESHOLD * 1.5);
    pullDistance.set(distance);
  }, [refreshing, pullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current || refreshing) return;
    pulling.current = false;
    const current = pullDistance.get();

    if (current >= THRESHOLD) {
      setRefreshing(true);
      pullDistance.set(THRESHOLD * 0.6);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        pullDistance.set(0);
      }
    } else {
      pullDistance.set(0);
    }
  }, [refreshing, onRefresh, pullDistance]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehaviorY: "contain" }}
    >
      {/* Spinner indicator */}
      <motion.div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: pullDistance,
          opacity: spinnerOpacity,
          scale: spinnerScale,
        }}
      >
        <motion.div
          animate={refreshing ? { rotate: 360 } : {}}
          transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}}
        >
          <Loader2 className="h-6 w-6 text-primary" />
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
};

export default PullToRefresh;
