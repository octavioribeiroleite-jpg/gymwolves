import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActiveChallenge {
  challengeId: string;
  groupId: string;
  challengeName: string;
}

/**
 * Returns all groups the user is an active member of, mapped as ActiveChallenge.
 * Uses group_members (which has data) instead of challenge_participants (which may be empty).
 */
export const useUserActiveChallenges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-active-challenges", user?.id],
    queryFn: async (): Promise<ActiveChallenge[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("group_members")
        .select("group_id, groups:group_id(id, name)")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      return (data || [])
        .filter((row: any) => row.groups)
        .map((row: any) => ({
          challengeId: row.groups.id,
          groupId: row.groups.id,
          challengeName: row.groups.name,
        }));
    },
    enabled: !!user,
  });
};
