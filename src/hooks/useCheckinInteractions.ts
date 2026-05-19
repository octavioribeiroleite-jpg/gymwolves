import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Likes counts per checkin
export const useCheckinLikeCounts = (checkinIds: string[]) => {
  return useQuery({
    queryKey: ["checkin-like-counts", checkinIds.join(",")],
    queryFn: async () => {
      const map = new Map<string, number>();
      if (checkinIds.length === 0) return map;
      const { data, error } = await supabase
        .from("checkin_likes" as any)
        .select("checkin_id")
        .in("checkin_id", checkinIds);
      if (error) throw error;
      (data || []).forEach((d: any) => {
        map.set(d.checkin_id, (map.get(d.checkin_id) || 0) + 1);
      });
      return map;
    },
    enabled: checkinIds.length > 0,
  });
};

// User's liked checkin ids
export const useUserCheckinLikes = (checkinIds: string[]) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-checkin-likes", user?.id, checkinIds.join(",")],
    queryFn: async () => {
      if (!user || checkinIds.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from("checkin_likes" as any)
        .select("checkin_id")
        .eq("user_id", user.id)
        .in("checkin_id", checkinIds);
      if (error) throw error;
      return new Set((data || []).map((d: any) => d.checkin_id));
    },
    enabled: !!user && checkinIds.length > 0,
  });
};

export const useToggleCheckinLike = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ checkinId, isLiked }: { checkinId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Não autenticado");
      if (isLiked) {
        const { error } = await supabase
          .from("checkin_likes" as any)
          .delete()
          .eq("checkin_id", checkinId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("checkin_likes" as any)
          .insert({ checkin_id: checkinId, user_id: user.id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkin-like-counts"] });
      qc.invalidateQueries({ queryKey: ["user-checkin-likes"] });
    },
  });
};

// Comments
export const useCheckinComments = (checkinId: string | null) => {
  return useQuery({
    queryKey: ["checkin-comments", checkinId],
    queryFn: async () => {
      if (!checkinId) return [];
      const { data, error } = await supabase
        .from("checkin_comments" as any)
        .select("*, profiles:user_id(id, display_name, avatar_url)")
        .eq("checkin_id", checkinId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!checkinId,
  });
};

export const useAddCheckinComment = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ checkinId, text }: { checkinId: string; text: string }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("checkin_comments" as any)
        .insert({ checkin_id: checkinId, user_id: user.id, text } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["checkin-comments", vars.checkinId] });
    },
  });
};
