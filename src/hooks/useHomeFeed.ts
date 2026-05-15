import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_SIZE = 5;

const useUserChallengeIds = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-challenge-ids", user?.id],
    queryFn: async () => {
      if (!user) return [] as string[];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (error) throw error;
      return (data || []).map((d: any) => d.challenge_id as string);
    },
    enabled: !!user,
  });
};

export const useHomeFeed = () => {
  const { user } = useAuth();
  const { data: challengeIds } = useUserChallengeIds();

  return useInfiniteQuery({
    queryKey: ["home-feed", user?.id, (challengeIds || []).join(",")],
    queryFn: async ({ pageParam }) => {
      if (!challengeIds || challengeIds.length === 0)
        return { data: [], nextCursor: null as string | null };

      let query = supabase
        .from("challenge_posts")
        .select("*, profiles:user_id(id, display_name, avatar_url), challenges:challenge_id(id, name)")
        .in("challenge_id", challengeIds)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (pageParam) query = query.lt("created_at", pageParam);

      const { data, error } = await query;
      if (error) throw error;
      const nextCursor =
        data && data.length === PAGE_SIZE ? data[data.length - 1].created_at : null;
      return { data: data || [], nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!user && !!challengeIds,
  });
};
