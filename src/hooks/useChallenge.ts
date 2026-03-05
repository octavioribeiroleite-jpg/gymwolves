import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useGroupChallenges = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ["challenges", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("group_id", groupId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });
};

export const useCreateChallenge = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      name: string;
      goalDays: number;
      startDate: string;
      endDate: string;
    }) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("challenges")
        .insert({
          group_id: params.groupId,
          name: params.name,
          goal_days_per_user: params.goalDays,
          start_date: params.startDate,
          end_date: params.endDate,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["challenges", vars.groupId] });
      toast.success("Desafio criado com sucesso!");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
