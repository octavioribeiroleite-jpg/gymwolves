import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CheckinDialog from "@/components/CheckinDialog";
import { useCheckinEvent } from "@/hooks/useCheckinEvent";
import { useUserActiveChallenges } from "@/hooks/useUserChallenges";
import { useHasCheckedInToday } from "@/hooks/useCheckins";
import { dispatchCheckinOpen } from "@/hooks/useCheckinEvent";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const { data: activeChallenges } = useUserActiveChallenges();
  const { data: todayDone = false } = useHasCheckedInToday();

  useCheckinEvent(useCallback((detail) => {
    setInitialDate(detail.date);
    setCheckinOpen(true);
  }, []));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <>
      {children}
      <BottomNav onCheckin={dispatchCheckinOpen} />
      <CheckinDialog
        open={checkinOpen}
        onOpenChange={(v) => { setCheckinOpen(v); if (!v) setInitialDate(undefined); }}
        alreadyCheckedIn={todayDone}
        activeChallenges={activeChallenges}
        initialDate={initialDate}
      />
    </>
  );
};

export default ProtectedRoute;
