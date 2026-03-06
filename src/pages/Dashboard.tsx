import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useUserGroups } from "@/hooks/useGroupData";
import { useProfile } from "@/hooks/useProfile";
import { useGroupCheckins, computeDaysActive, computeStreaks, hasCheckedInToday, useDeleteTodayCheckins } from "@/hooks/useCheckins";
import { useUserActiveChallenges } from "@/hooks/useUserChallenges";
import { Loader2 } from "lucide-react";

import CheckinDialog from "@/components/CheckinDialog";
import ActivityFeed from "@/components/ActivityFeed";
import Onboarding from "./Onboarding";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WorkoutStatusCard from "@/components/dashboard/WorkoutStatusCard";
import HomeWelcome from "@/components/dashboard/HomeWelcome";
import HomeChallengesList from "@/components/dashboard/HomeChallengesList";
import DashboardFAB from "@/components/dashboard/DashboardFAB";

const Dashboard = () => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const [checkinOpen, setCheckinOpen] = useState(false);

  const { data: groups, isLoading } = useUserGroups();
  const { data: profile } = useProfile();
  const { data: checkins } = useGroupCheckins(activeGroupId || undefined);
  const { data: activeChallenges } = useUserActiveChallenges();
  const deleteTodayCheckins = useDeleteTodayCheckins();
  // Aggregate stats across all groups - for now use active group checkins
  // TODO: aggregate from all groups when we have a multi-group checkins hook
  const todayDone = useMemo(
    () => (checkins && user ? hasCheckedInToday(checkins, user.id) : false),
    [checkins, user]
  );

  const globalStats = useMemo(() => {
    if (!checkins || !user) return { streak: 0, daysActive: 0, record: 0 };
    const days = computeDaysActive(checkins, user.id);
    const streaks = computeStreaks(checkins, user.id);
    return { streak: streaks.current, daysActive: days, record: streaks.best };
  }, [checkins, user]);

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

        <HomeChallengesList />

        {activeGroupId && <ActivityFeed groupId={activeGroupId} />}
      </div>

      <DashboardFAB onCheckin={() => setCheckinOpen(true)} />

      {activeGroupId && (
        <CheckinDialog
          open={checkinOpen}
          onOpenChange={setCheckinOpen}
          groupId={activeGroupId}
          alreadyCheckedIn={todayDone}
          activeChallenges={activeChallenges}
        />
      )}
    </div>
  );
};

export default Dashboard;
