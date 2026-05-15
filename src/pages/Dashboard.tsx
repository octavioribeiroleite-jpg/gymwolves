import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useQueryClient } from "@tanstack/react-query";
import { useUserGroups } from "@/hooks/useGroupData";
import { useProfile, useUpdateWeeklyGoal } from "@/hooks/useProfile";
import { useAllUserCheckins, computeDaysActive, computeStreaks, useHasCheckedInToday, useDeleteTodayCheckins } from "@/hooks/useCheckins";
import { useBackHandler } from "@/hooks/useBackHandler";
import { useCheckinNotifications } from "@/hooks/useCheckinNotifications";
import { dispatchCheckinOpen } from "@/hooks/useCheckinEvent";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

import ActivityFeed from "@/components/ActivityFeed";
import Onboarding from "./Onboarding";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WorkoutStatusCard from "@/components/dashboard/WorkoutStatusCard";
import QuickStats from "@/components/dashboard/QuickStats";
import HomeChallengesList from "@/components/dashboard/HomeChallengesList";
import HomeGroupsList from "@/components/dashboard/HomeGroupsList";
import HomeFeed from "@/components/dashboard/HomeFeed";
import WeeklySummary from "@/components/dashboard/WeeklySummary";
import PullToRefresh from "@/components/PullToRefresh";
import RecentHistory from "@/components/dashboard/RecentHistory";
import MonthlyHeatmap from "@/components/dashboard/MonthlyHeatmap";
import MarkPastDaySheet from "@/components/checkin/MarkPastDaySheet";
import { useUserActiveChallenges } from "@/hooks/useUserChallenges";
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
  const { showExitDialog, confirmExit, cancelExit } = useBackHandler();
  useCheckinNotifications();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const { data: groups, isLoading } = useUserGroups();
  const { data: profile } = useProfile();
  const { data: todayDone = false } = useHasCheckedInToday();
  const deleteTodayCheckins = useDeleteTodayCheckins();
  const updateGoal = useUpdateWeeklyGoal();
  const { data: activeChallenges } = useUserActiveChallenges();

  const heatmapRef = useRef<HTMLDivElement>(null);
  const [pastDay, setPastDay] = useState<Date | null>(null);
  const [highlightMissing, setHighlightMissing] = useState(false);

  useEffect(() => {
    if (!highlightMissing) return;
    const t = setTimeout(() => setHighlightMissing(false), 2500);
    return () => clearTimeout(t);
  }, [highlightMissing]);

  const handleUpdatePastCheckins = useCallback(() => {
    setHighlightMissing(true);
    setTimeout(() => {
      heatmapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, []);

  const allGroupIds = useMemo(() => groups?.map((g: any) => g.id) || [], [groups]);
  const { data: allCheckins } = useAllUserCheckins(allGroupIds.length > 0 ? allGroupIds : undefined);

  const globalStats = useMemo(() => {
    if (!allCheckins || !user) return { streak: 0, daysActive: 0, record: 0 };
    const days = computeDaysActive(allCheckins, user.id);
    const streaks = computeStreaks(allCheckins, user.id);
    return { streak: streaks.current, daysActive: days, record: streaks.best };
  }, [allCheckins, user]);

  // Get today's checkin for the status card
  const todayCheckin = useMemo(() => {
    if (!allCheckins || !user) return null;
    const today = format(new Date(), "yyyy-MM-dd");
    const found = [...allCheckins]
      .reverse()
      .find((c) => c.user_id === user.id && format(parseISO(c.checkin_at), "yyyy-MM-dd") === today);
    return found || null;
  }, [allCheckins, user]);

  // Active group name
  const activeGroupName = useMemo(() => {
    if (!groups || !activeGroupId) return undefined;
    return groups.find((g: any) => g.id === activeGroupId)?.name;
  }, [groups, activeGroupId]);

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
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen bg-background pb-20">
      <DashboardHeader
        userName={userName}
        streak={globalStats.streak}
        todayDone={todayDone}
        activeGroupName={activeGroupName}
      />

      <div className="mx-auto max-w-md space-y-3 px-5 pt-1.5 pb-4">
        {/* 1. Card principal do dia */}
        <WorkoutStatusCard
          todayDone={todayDone}
          onCheckin={() => dispatchCheckinOpen()}
          onDelete={() => deleteTodayCheckins.mutate()}
          isDeleting={deleteTodayCheckins.isPending}
          onUpdatePastCheckins={!todayDone ? () => navigate("/atualizar-checkins") : undefined}
          todayCheckin={todayCheckin}
        />

        {/* 2. Sua semana */}
        {allCheckins && allCheckins.length > 0 && (
          <WeeklySummary
            checkins={allCheckins}
            weeklyGoal={(profile as any)?.weekly_goal ?? 5}
            onGoalChange={(g) => updateGoal.mutate(g)}
          />
        )}

        {/* 3. Métricas rápidas */}
        <QuickStats
          streak={globalStats.streak}
          daysActive={globalStats.daysActive}
          record={globalStats.record}
        />

        {/* 4. Desafio ativo */}
        <HomeChallengesList />

        {/* 5. Seus grupos */}
        <HomeGroupsList />

        {/* 6. Feed estilo Instagram */}
        <HomeFeed />

        {/* 7. Atividade do grupo ativo */}
        {activeGroupId && <ActivityFeed groupId={activeGroupId} compact maxItems={2} />}

        {/* 6. Mapa de treinos compacto */}
        {allCheckins && allCheckins.length > 0 && (
          <div ref={heatmapRef}>
            <MonthlyHeatmap
              checkins={allCheckins}
              compact
              highlightMissing={highlightMissing}
              onMarkPastDay={(d) => setPastDay(d)}
            />
          </div>
        )}

        {/* 7. Últimos check-ins */}
        {allCheckins && allCheckins.length > 0 && (
          <RecentHistory checkins={allCheckins} compact maxItems={2} />
        )}
      </div>


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

      <MarkPastDaySheet
        date={pastDay}
        onClose={() => setPastDay(null)}
        groupId={activeGroupId || undefined}
        activeChallenges={activeChallenges}
      />
    </div>
    </PullToRefresh>
  );
};

export default Dashboard;
