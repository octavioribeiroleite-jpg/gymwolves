import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserGroups } from "@/hooks/useGroupData";

const PAGE_SIZE = 8;

export type FeedItem =
  | {
      type: "post";
      id: string;
      createdAt: string;
      groupId: string;
      groupName: string;
      post: any;
    }
  | {
      type: "checkin";
      id: string;
      createdAt: string;
      groupId: string;
      groupName: string;
      checkin: any;
    };

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

export const useHomeUnifiedFeed = () => {
  const { user } = useAuth();
  const { data: challengeIds } = useUserChallengeIds();
  const { data: groups } = useUserGroups();

  const groupIds = (groups || []).map((g: any) => g.id);
  const groupNameById = new Map<string, string>(
    (groups || []).map((g: any) => [g.id, g.name])
  );

  return useInfiniteQuery({
    queryKey: [
      "home-unified-feed",
      user?.id,
      groupIds.join(","),
      (challengeIds || []).join(","),
    ],
    queryFn: async ({ pageParam }): Promise<{ items: FeedItem[]; nextCursor: string | null }> => {
      const cursor = pageParam as string | null;

      const postsP =
        challengeIds && challengeIds.length > 0
          ? (() => {
              let q = supabase
                .from("challenge_posts")
                .select(
                  "*, profiles:user_id(id, display_name, avatar_url), challenges:challenge_id(id, name, group_id)"
                )
                .in("challenge_id", challengeIds)
                .order("created_at", { ascending: false })
                .limit(PAGE_SIZE);
              if (cursor) q = q.lt("created_at", cursor);
              return q;
            })()
          : Promise.resolve({ data: [], error: null } as any);

      const checkinsP =
        groupIds.length > 0
          ? (() => {
              let q = supabase
                .from("checkins")
                .select(
                  "*, profiles:user_id(id, display_name, avatar_url), groups:group_id(id, name)"
                )
                .in("group_id", groupIds)
                .order("checkin_at", { ascending: false })
                .limit(PAGE_SIZE);
              if (cursor) q = q.lt("checkin_at", cursor);
              return q;
            })()
          : Promise.resolve({ data: [], error: null } as any);

      const [postsRes, checkinsRes] = await Promise.all([postsP, checkinsP]);
      if (postsRes.error) throw postsRes.error;
      if (checkinsRes.error) throw checkinsRes.error;

      const postItems: FeedItem[] = (postsRes.data || []).map((p: any) => ({
        type: "post",
        id: `post-${p.id}`,
        createdAt: p.created_at,
        groupId: p.challenges?.group_id || "",
        groupName: p.challenges?.name || groupNameById.get(p.challenges?.group_id) || "",
        post: p,
      }));

      const checkinItems: FeedItem[] = (checkinsRes.data || []).map((c: any) => ({
        type: "checkin",
        id: `checkin-${c.id}`,
        createdAt: c.checkin_at,
        groupId: c.group_id,
        groupName: c.groups?.name || groupNameById.get(c.group_id) || "",
        checkin: c,
      }));

      const merged = [...postItems, ...checkinItems].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      );

      const items = merged.slice(0, PAGE_SIZE);
      const nextCursor =
        items.length === PAGE_SIZE ? items[items.length - 1].createdAt : null;

      return { items, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!user && !!groups && !!challengeIds,
  });
};
