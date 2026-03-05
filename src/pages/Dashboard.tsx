import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { useGroupCheckins, computeDaysActive, computeStreaks, hasCheckedInToday } from "@/hooks/useCheckins";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";

import CheckinDialog from "@/components/CheckinDialog";
import ActivityFeed from "@/components/ActivityFeed";
import Onboarding from "./Onboarding";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChallengeInfoCard from "@/components/dashboard/ChallengeInfoCard";
import WorkoutStatusCard from "@/components/dashboard/WorkoutStatusCard";
import ProgressSection from "@/components/dashboard/ProgressSection";
import StatsSection from "@/components/dashboard/StatsSection";
import MiniRanking from "@/components/dashboard/MiniRanking";
import DashboardFAB from "@/components/dashboard/DashboardFAB";

const Dashboard = () => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const [checkinOpen, setCheckinOpen] = useState(false);

  const { data: group, isLoading } = useGroupDetail(activeGroupId || undefined);
  const { data: members } = useGroupMembers(activeGroupId || undefined);
  const { data: checkins } = useGroupCheckins(activeGroupId || undefined);
  const { data: profile } = useProfile();

  const todayDone = useMemo(
    () => (checkins && user ? hasCheckedInToday(checkins, user.id) : false),
    [checkins, user]
  );

  const myStats = useMemo(() => {
    if (!checkins || !user || !group) return null;
    const days = computeDaysActive(checkins, user.id);
    const streaks = computeStreaks(checkins, user.id);
    const goal = (group as any).goal_total || 200;
    return { days, goal, ...streaks };
  }, [checkins, user, group]);

  const daysRemaining = useMemo(() => {
    if (!group) return null;
    const g = group as any;
    if (!g.end_date) return null;
    return Math.max(0, differenceInDays(new Date(g.end_date), new Date()));
  }, [group]);

  const topMembers = useMemo(() => {
    if (!members || !checkins || !group) return [];
    return members
      .map((m) => {
        const p = m.profiles as any;
        const days = computeDaysActive(checkins, m.user_id);
        return { userId: m.user_id, name: p?.display_name || "Sem nome", days };
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);
  }, [members, checkins, group]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeGroupId || !group) {
    return <Onboarding />;
  }

  const groupAny = group as any;
  const leaderName = profile?.display_name || "Líder";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader groupName={group.name} />

      <div className="mx-auto max-w-md space-y-6 px-4 py-4">
        <ChallengeInfoCard
          leaderName={leaderName}
          userName={profile?.display_name || "Você"}
          daysRemaining={daysRemaining}
        />

        <WorkoutStatusCard
          todayDone={todayDone}
          onCheckin={() => setCheckinOpen(true)}
        />

        {myStats && (
          <ProgressSection current={myStats.days} total={myStats.goal} />
        )}

        {myStats && (
          <StatsSection
            streak={myStats.current}
            daysActive={myStats.days}
            record={myStats.best}
          />
        )}

        {activeGroupId && <ActivityFeed groupId={activeGroupId} />}
        <MiniRanking topMembers={topMembers} currentUserId={user?.id} />
      </div>

      <DashboardFAB onCheckin={() => setCheckinOpen(true)} />

      <CheckinDialog
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        groupId={activeGroupId}
        alreadyCheckedIn={todayDone}
      />
      
    </div>
  );
};

export default Dashboard;
