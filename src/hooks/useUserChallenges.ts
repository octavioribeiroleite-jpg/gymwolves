import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActiveChallenge {
  challengeId: string;
  groupId: string;
  challengeName: string;
}

export const useUserActiveChallenges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-active-challenges", user?.id],
    queryFn: async (): Promise<ActiveChallenge[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id, challenges(id, name, group_id, status)")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      return (data || [])
        .filter((row: any) => row.challenges?.status === "active" && row.challenges?.group_id)
        .map((row: any) => ({
          challengeId: row.challenges.id,
          groupId: row.challenges.group_id,
          challengeName: row.challenges.name,
        }));
    },
    enabled: !!user,
  });
};
