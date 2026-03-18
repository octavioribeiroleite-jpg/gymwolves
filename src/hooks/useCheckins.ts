import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

// ── Get all checkins for a group ──
export const useGroupCheckins = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ["checkins", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("group_id", groupId)
        .order("checkin_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!groupId,
  });
};

// ── Create a checkin ──
export const useCreateCheckin = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      title: string;
      note?: string;
      workoutType?: string;
      proofUrl?: string;
      durationMin?: number;
      calories?: number;
      distanceKm?: number;
      steps?: number;
      checkinDate?: Date;
    }) => {
      if (!user) throw new Error("Não autenticado");
      const checkinAt = params.checkinDate
        ? new Date(params.checkinDate.getFullYear(), params.checkinDate.getMonth(), params.checkinDate.getDate(), 12, 0, 0).toISOString()
        : new Date().toISOString();
      const { data, error } = await supabase
        .from("checkins")
        .insert({
          group_id: params.groupId,
          user_id: user.id,
          title: params.title,
          note: params.note || null,
          proof_type: params.proofUrl ? "photo" : "manual",
          proof_url: params.proofUrl || null,
          workout_type: params.workoutType || "musculacao",
          checkin_at: checkinAt,
          duration_min: params.durationMin ? Math.round(params.durationMin) : null,
          calories: params.calories ? Math.round(params.calories) : null,
          distance_km: params.distanceKm || null,
          steps: params.steps || null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["checkins", vars.groupId] });
      toast.success("Treino registrado! 💪");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Create checkins in ALL active challenges (batch) ──
export const useCreateCheckinAll = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      challenges: { challengeId: string; groupId: string }[];
      title: string;
      note?: string;
      workoutType?: string;
      proofUrl?: string;
      durationMin?: number;
      calories?: number;
      distanceKm?: number;
      steps?: number;
    }) => {
      if (!user) throw new Error("Não autenticado");
      if (!params.challenges.length) throw new Error("Nenhum desafio ativo");

      const now = new Date().toISOString();
      const today = format(new Date(), "yyyy-MM-dd");

      // Unique group IDs to avoid duplicate checkins for same group
      const uniqueGroups = [...new Set(params.challenges.map((c) => c.groupId))];

      // Insert checkins for each unique group
      const { error: checkinError } = await supabase.from("checkins").insert(
        uniqueGroups.map((groupId) => ({
          group_id: groupId,
          user_id: user.id,
          title: params.title,
          note: params.note || null,
          proof_type: params.proofUrl ? "photo" : "manual",
          proof_url: params.proofUrl || null,
          workout_type: params.workoutType || "musculacao",
          checkin_at: now,
          duration_min: params.durationMin ? Math.round(params.durationMin) : null,
          calories: params.calories ? Math.round(params.calories) : null,
          distance_km: params.distanceKm || null,
          steps: params.steps || null,
        }) as any)
      );
      if (checkinError) throw checkinError;

      // Try to insert workout_logs (may fail if challenge_participants is empty, ignore)
      try {
        await supabase.from("workout_logs").insert(
          params.challenges.map((c) => ({
            challenge_id: c.challengeId,
            user_id: user.id,
            workout_date: today,
          }))
        );
      } catch {
        // workout_logs may fail due to RLS if challenge_participants is empty — safe to ignore
      }

      return { groupIds: uniqueGroups, count: params.challenges.length };
    },
    onSuccess: (result) => {
      result.groupIds.forEach((gid) => {
        qc.invalidateQueries({ queryKey: ["checkins", gid] });
      });
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      toast.success(`Treino registrado em ${result.count} desafio${result.count > 1 ? "s" : ""}! 💪`);
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Delete a checkin ──
export const useDeleteCheckin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, groupId }: { id: string; groupId: string }) => {
      const { error } = await supabase
        .from("checkins")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      qc.invalidateQueries({ queryKey: ["checkins", groupId] });
      toast.success("Treino removido");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Compute days active (unique dates) ──
export const computeDaysActive = (checkins: any[], userId: string): number => {
  const dates = new Set(
    checkins
      .filter((c) => c.user_id === userId)
      .map((c) => format(new Date(c.checkin_at), "yyyy-MM-dd"))
  );
  return dates.size;
};

// ── Get unique dates for a user ──
export const getUserDates = (checkins: any[], userId: string): Set<string> => {
  return new Set(
    checkins
      .filter((c) => c.user_id === userId)
      .map((c) => format(new Date(c.checkin_at), "yyyy-MM-dd"))
  );
};

// ── Compute streaks ──
export const computeStreaks = (checkins: any[], userId: string) => {
  const dates = [
    ...new Set(
      checkins
        .filter((c) => c.user_id === userId)
        .map((c) => format(new Date(c.checkin_at), "yyyy-MM-dd"))
    ),
  ].sort();

  if (!dates.length) return { current: 0, best: 0 };

  let streak = 1;
  let best = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
  const last = dates[dates.length - 1];
  const current = last === today || last === yesterday ? streak : 0;

  return { current, best };
};

// ── Fetch checkins for the user across ALL their groups ──
export const useAllUserCheckins = (groupIds: string[] | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["all-user-checkins", user?.id, groupIds],
    queryFn: async () => {
      if (!user || !groupIds || !groupIds.length) return [];
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .in("group_id", groupIds)
        .order("checkin_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user && !!groupIds && groupIds.length > 0,
  });
};

// ── Check if user checked in today ──
export const hasCheckedInToday = (checkins: any[], userId: string): boolean => {
  const today = format(new Date(), "yyyy-MM-dd");
  return checkins.some(
    (c) =>
      c.user_id === userId &&
      format(new Date(c.checkin_at), "yyyy-MM-dd") === today
  );
};

// ── Check if user has checked in today (any group) ──
export const useHasCheckedInToday = () => {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["checkins-today", user?.id, today],
    queryFn: async () => {
      if (!user) return false;
      const { count, error } = await supabase
        .from("checkins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("checkin_at", today)
        .lt("checkin_at", tomorrow);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
    enabled: !!user,
  });
};

// ── Delete all of today's checkins + workout_logs for the user ──
export const useDeleteTodayCheckins = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const today = format(new Date(), "yyyy-MM-dd");
      const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

      // Delete today's checkins
      const { error: checkinError } = await supabase
        .from("checkins")
        .delete()
        .eq("user_id", user.id)
        .gte("checkin_at", today)
        .lt("checkin_at", tomorrow);
      if (checkinError) throw checkinError;

      // Delete today's workout_logs
      const { error: logError } = await supabase
        .from("workout_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("workout_date", today);
      if (logError) throw logError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkins"] });
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      toast.success("Treino removido");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
