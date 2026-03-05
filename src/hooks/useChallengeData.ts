import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useUserChallenges = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get challenges where user is participant
      const { data: parts, error: pErr } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (pErr) throw pErr;
      if (!parts.length) return [];

      const ids = parts.map((p) => p.challenge_id);
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .in("id", ids)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useChallengeParticipants = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["challenge-participants", challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("*, profiles:user_id(id, display_name, avatar_url)")
        .eq("challenge_id", challengeId)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId,
  });
};

export const useChallengeDetail = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["challenge-detail", challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId,
  });
};

export const useCreateChallengeNew = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      goalDays: number;
      startDate: string;
      endDate: string;
    }) => {
      if (!user) throw new Error("Não autenticado");
      // Create challenge (standalone, no group_id)
      const { data: challenge, error } = await supabase
        .from("challenges")
        .insert({
          name: params.name,
          goal_days_per_user: params.goalDays,
          start_date: params.startDate,
          end_date: params.endDate,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      // Add creator as owner participant
      const { error: pErr } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          role: "owner",
        });
      if (pErr) throw pErr;

      // Create default invite
      const { error: iErr } = await supabase
        .from("challenge_invites")
        .insert({
          challenge_id: challenge.id,
          created_by: user.id,
        });
      if (iErr) throw iErr;

      return challenge;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-challenges"] });
      toast.success("Desafio criado com sucesso!");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useJoinChallengeByCode = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error("Não autenticado");
      const { data: challenges, error: fErr } = await supabase
        .rpc("find_challenge_by_code", { _code: code });
      if (fErr) throw fErr;
      if (!challenges || challenges.length === 0) throw new Error("Código inválido ou desafio encerrado");

      const challenge = challenges[0];
      const { error } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          role: "member",
        });
      if (error) {
        if (error.code === "23505") throw new Error("Você já participa deste desafio");
        throw error;
      }
      return challenge;
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["user-challenges"] });
      toast.success(`Você entrou no desafio "${c.name}"!`);
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useChallengeInvites = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["challenge-invites", challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from("challenge_invites")
        .select("*")
        .eq("challenge_id", challengeId);
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId,
  });
};

export const useRemoveParticipant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ participantId, challengeId }: { participantId: string; challengeId: string }) => {
      const { error } = await supabase
        .from("challenge_participants")
        .delete()
        .eq("id", participantId);
      if (error) throw error;
      return challengeId;
    },
    onSuccess: (challengeId) => {
      qc.invalidateQueries({ queryKey: ["challenge-participants", challengeId] });
      toast.success("Participante removido");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useLeaveChallenge = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-challenges"] });
      toast.success("Você saiu do desafio");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
