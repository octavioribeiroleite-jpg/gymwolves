import { useMemo, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useQueryClient } from "@tanstack/react-query";
import { useUserGroups } from "@/hooks/useGroupData";
import { useProfile, useUpdateWeeklyGoal } from "@/hooks/useProfile";
import { useAllUserCheckins, computeDaysActive, computeStreaks, useHasCheckedInToday, useDeleteTodayCheckins } from "@/hooks/useCheckins";
import { useUserActiveChallenges } from "@/hooks/useUserChallenges";
import { useBackHandler } from "@/hooks/useBackHandler";
import { useCheckinNotifications } from "@/hooks/useCheckinNotifications";
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
import PullToRefresh from "@/components/PullToRefresh";
import RecentHistory from "@/components/dashboard/RecentHistory";
import MonthlyHeatmap from "@/components/dashboard/MonthlyHeatmap";
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
  useCheckinNotifications();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const { data: groups, isLoading } = useUserGroups();
  const { data: profile } = useProfile();
  const { data: activeChallenges } = useUserActiveChallenges();
  const { data: todayDone = false } = useHasCheckedInToday();
  const deleteTodayCheckins = useDeleteTodayCheckins();
  const updateGoal = useUpdateWeeklyGoal();

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
      <DashboardHeader userName={userName} streak={globalStats.streak} todayDone={todayDone} />

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
            <WeeklySummary
              checkins={allCheckins}
              weeklyGoal={(profile as any)?.weekly_goal ?? 5}
              onGoalChange={(g) => updateGoal.mutate(g)}
            />
            <RecentHistory checkins={allCheckins} />
            <MonthlyHeatmap checkins={allCheckins} />
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

      <AlertDialog open={showExitDialog} onOpenChange={cancelExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do app?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do GymWolves?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelExit}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>Sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
