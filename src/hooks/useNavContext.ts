import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupCheckins, computeDaysActive, hasCheckedInToday } from "@/hooks/useCheckins";
import { useUserGroups, useGroupMembers } from "@/hooks/useGroupData";
import { format, isSameMonth } from "date-fns";

export interface NavContextData {
  /** Whether user checked in today */
  todayDone: boolean | null;
  /** Number of active groups */
  groupCount: number | null;
  /** Days trained this month */
  monthDays: number | null;
  /** User's ranking position (1-indexed) */
  rankPosition: number | null;
}

export const useNavContext = (): NavContextData => {
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const { data: checkins } = useGroupCheckins(activeGroupId || undefined);
  const { data: groups } = useUserGroups();
  const { data: members } = useGroupMembers(activeGroupId || undefined);

  const todayDone = useMemo(() => {
    if (!checkins || !user) return null;
    return hasCheckedInToday(checkins, user.id);
  }, [checkins, user]);

  const groupCount = useMemo(() => {
    if (!groups) return null;
    return groups.length;
  }, [groups]);

  const monthDays = useMemo(() => {
    if (!checkins || !user) return null;
    const now = new Date();
    const userCheckins = checkins.filter(
      (c) => c.user_id === user.id && isSameMonth(new Date(c.checkin_at), now)
    );
    const uniqueDates = new Set(
      userCheckins.map((c) => format(new Date(c.checkin_at), "yyyy-MM-dd"))
    );
    return uniqueDates.size;
  }, [checkins, user]);

  const rankPosition = useMemo(() => {
    if (!members || !checkins || !user) return null;
    const scores = members
      .map((m) => ({
        userId: m.user_id,
        days: computeDaysActive(checkins, m.user_id),
      }))
      .sort((a, b) => b.days - a.days);

    const idx = scores.findIndex((s) => s.userId === user.id);
    if (idx === -1) return null;

    // Calculate actual rank (handle ties)
    let rank = 1;
    for (let i = 0; i < idx; i++) {
      if (scores[i].days > scores[idx].days) rank = i + 2;
    }
    return rank;
  }, [members, checkins, user]);

  return { todayDone, groupCount, monthDays, rankPosition };
};
