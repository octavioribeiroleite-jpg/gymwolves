import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Fetch posts with cursor pagination ──
export const useChallengePosts = (challengeId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["challenge-posts", challengeId],
    queryFn: async ({ pageParam }) => {
      if (!challengeId) return { data: [], nextCursor: null };
      let query = supabase
        .from("challenge_posts")
        .select("*, profiles:user_id(id, display_name, avatar_url)")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }

      const { data, error } = await query;
      if (error) throw error;
      const nextCursor = data && data.length === 20 ? data[data.length - 1].created_at : null;
      return { data: data || [], nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!challengeId,
  });
};

// ── Get user's liked post IDs ──
export const useUserLikes = (challengeId: string | undefined, postIds: string[]) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-likes", challengeId, postIds.join(",")],
    queryFn: async () => {
      if (!user || postIds.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from("challenge_post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);
      if (error) throw error;
      return new Set((data || []).map((d: any) => d.post_id));
    },
    enabled: !!user && postIds.length > 0,
  });
};

// ── Toggle like ──
export const useToggleLike = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean; challengeId: string }) => {
      if (!user) throw new Error("Não autenticado");
      if (isLiked) {
        await supabase
          .from("challenge_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("challenge_post_likes")
          .insert({ post_id: postId, user_id: user.id } as any);
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["challenge-posts", vars.challengeId] });
      qc.invalidateQueries({ queryKey: ["user-likes", vars.challengeId] });
    },
  });
};

// ── Create post ──
export const useCreatePost = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ challengeId, imageUrl, caption }: { challengeId: string; imageUrl?: string; caption?: string }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("challenge_posts")
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          image_url: imageUrl || null,
          caption: caption || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["challenge-posts", vars.challengeId] });
      toast.success("Post publicado! 🎉");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Update post ──
export const useUpdatePost = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, caption, challengeId }: { postId: string; caption: string; challengeId: string }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("challenge_posts")
        .update({ caption } as any)
        .eq("id", postId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["challenge-posts", vars.challengeId] });
      toast.success("Post atualizado!");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Delete post ──
export const useDeletePost = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, challengeId }: { postId: string; challengeId: string }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("challenge_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["challenge-posts", vars.challengeId] });
      toast.success("Post excluído");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Comments ──
export const usePostComments = (postId: string | null) => {
  return useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("challenge_post_comments")
        .select("*, profiles:user_id(id, display_name, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text, challengeId }: { postId: string; text: string; challengeId: string }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("challenge_post_comments")
        .insert({ post_id: postId, user_id: user.id, text } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["post-comments", vars.postId] });
      qc.invalidateQueries({ queryKey: ["challenge-posts", vars.challengeId] });
    },
  });
};
