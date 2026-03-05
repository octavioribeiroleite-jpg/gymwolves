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
    }) => {
      if (!user) throw new Error("Não autenticado");
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
          checkin_at: new Date().toISOString(),
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

// ── Check if user checked in today ──
export const hasCheckedInToday = (checkins: any[], userId: string): boolean => {
  const today = format(new Date(), "yyyy-MM-dd");
  return checkins.some(
    (c) =>
      c.user_id === userId &&
      format(new Date(c.checkin_at), "yyyy-MM-dd") === today
  );
};
