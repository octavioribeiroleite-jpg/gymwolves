import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const useChallengeMessages = (challengeId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ["challenge-messages", challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from("challenge_messages")
        .select("*, profiles:user_id(id, display_name, avatar_url)")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId && enabled,
  });
};

export const useChatRealtime = (challengeId: string | undefined, enabled: boolean) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!challengeId || !enabled) return;
    const channel = supabase
      .channel(`chat-${challengeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "challenge_messages", filter: `challenge_id=eq.${challengeId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["challenge-messages", challengeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId, enabled, qc]);
};

export const useSendMessage = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ challengeId, text }: { challengeId: string; text: string }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("challenge_messages")
        .insert({ challenge_id: challengeId, user_id: user.id, text } as any);
      if (error) throw error;
    },
  });
};
