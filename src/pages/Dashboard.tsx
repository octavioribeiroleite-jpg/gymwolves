import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useUserGroups } from "@/hooks/useGroupData";
import { useProfile } from "@/hooks/useProfile";
import { useAllUserCheckins, computeDaysActive, computeStreaks, useHasCheckedInToday, useDeleteTodayCheckins } from "@/hooks/useCheckins";
import { useUserActiveChallenges } from "@/hooks/useUserChallenges";
import { useBackHandler } from "@/hooks/useBackHandler";
import { Loader2 } from "lucide-react";

import CheckinDialog from "@/components/CheckinDialog";
import ActivityFeed from "@/components/ActivityFeed";
import Onboarding from "./Onboarding";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WorkoutStatusCard from "@/components/dashboard/WorkoutStatusCard";
import HomeWelcome from "@/components/dashboard/HomeWelcome";
import HomeChallengesList from "@/components/dashboard/HomeChallengesList";
import DashboardFAB from "@/components/dashboard/DashboardFAB";
import WeeklySummary from "@/components/dashboard/WeeklySummary";
import RecentHistory from "@/components/dashboard/RecentHistory";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const { showExitDialog, confirmExit, cancelExit } = useBackHandler();

  const { data: groups, isLoading } = useUserGroups();
  const { data: profile } = useProfile();
  const { data: activeChallenges } = useUserActiveChallenges();
  const { data: todayDone = false } = useHasCheckedInToday();
  const deleteTodayCheckins = useDeleteTodayCheckins();

  // Get all group IDs for global checkin query
  const allGroupIds = useMemo(() => groups?.map((g: any) => g.id) || [], [groups]);
  const { data: allCheckins } = useAllUserCheckins(allGroupIds.length > 0 ? allGroupIds : undefined);

  const globalStats = useMemo(() => {
    if (!allCheckins || !user) return { streak: 0, daysActive: 0, record: 0 };
    const days = computeDaysActive(allCheckins, user.id);
    const streaks = computeStreaks(allCheckins, user.id);
    return { streak: streaks.current, daysActive: days, record: streaks.best };
  }, [allCheckins, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return <Onboarding />;
  }

  const userName = profile?.display_name || "Você";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={userName} />

      <div className="mx-auto max-w-md space-y-6 px-4 py-4">
        <HomeWelcome
          streak={globalStats.streak}
          daysActive={globalStats.daysActive}
          record={globalStats.record}
        />

        <WorkoutStatusCard
          todayDone={todayDone}
          onCheckin={() => setCheckinOpen(true)}
          onDelete={() => deleteTodayCheckins.mutate()}
          isDeleting={deleteTodayCheckins.isPending}
        />

        {allCheckins && allCheckins.length > 0 && (
          <>
            <WeeklySummary checkins={allCheckins} />
            <RecentHistory checkins={allCheckins} />
          </>
        )}

        <HomeChallengesList />

        {activeGroupId && <ActivityFeed groupId={activeGroupId} />}
      </div>

      <DashboardFAB onCheckin={() => setCheckinOpen(true)} />

      <CheckinDialog
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        alreadyCheckedIn={todayDone}
        activeChallenges={activeChallenges}
      />
    </div>
  );
};

export default Dashboard;
