import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

export const useWorkoutLogs = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["workout-logs", challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("workout_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId,
  });
};

export const useToggleWorkout = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      date,
      isCompleted,
    }: {
      challengeId: string;
      date: string;
      isCompleted: boolean;
    }) => {
      if (!user) throw new Error("Não autenticado");

      if (isCompleted) {
        // Remove workout log
        const { error } = await supabase
          .from("workout_logs")
          .delete()
          .eq("challenge_id", challengeId)
          .eq("user_id", user.id)
          .eq("workout_date", date);
        if (error) throw error;
      } else {
        // Add workout log
        const { error } = await supabase
          .from("workout_logs")
          .insert({
            challenge_id: challengeId,
            user_id: user.id,
            workout_date: date,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["workout-logs", vars.challengeId] });
      toast.success(vars.isCompleted ? "Treino desmarcado" : "Treino marcado! 💪");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const computeStreaks = (dates: string[]) => {
  if (!dates.length) return { current: 0, best: 0 };

  const sorted = [...dates].sort();
  let current = 1;
  let best = 1;
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  // Check if current streak includes today or yesterday
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
  const lastDate = sorted[sorted.length - 1];
  current = lastDate === today || lastDate === yesterday ? streak : 0;

  return { current, best };
};
