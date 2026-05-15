import { useMemo } from "react";
import { Loader2, ImageIcon, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHomeFeed } from "@/hooks/useHomeFeed";
import { useUserLikes, useToggleLike } from "@/hooks/useChallengePosts";
import PostCard from "@/components/challenge/PostCard";
import { Button } from "@/components/ui/button";

const HomeFeed = () => {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeFeed();

  const posts = useMemo(() => data?.pages.flatMap((p) => p.data) || [], [data]);
  const postIds = useMemo(() => posts.map((p: any) => p.id), [posts]);

  // Group like queries by challenge to reuse existing hook contract
  const allChallengeIds = useMemo(
    () => Array.from(new Set(posts.map((p: any) => p.challenge_id))),
    [posts]
  );
  // Use a single combined likes query (hook accepts a challengeId, but only filters by post_id + user_id)
  const { data: likedSet } = useUserLikes(allChallengeIds[0], postIds);
  const toggleLike = useToggleLike();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div>
        <h2 className="text-[13px] font-bold mb-2">Feed da matilha</h2>
        <div className="rounded-2xl surface-1 border border-subtle p-6 text-center">
          <ImageIcon className="mx-auto h-7 w-7 text-muted-foreground/30 mb-2" />
          <p className="text-[13px] text-muted-foreground">
            Ninguém postou ainda. Seja o primeiro do seu grupo!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[13px] font-bold mb-2">Feed da matilha</h2>
      <div className="space-y-3">
        {posts.map((post: any) => (
          <div key={post.id} className="space-y-1.5">
            {post.challenges?.name && (
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
                <Trophy className="h-3 w-3 text-primary" />
                <span className="truncate">{post.challenges.name}</span>
              </div>
            )}
            <PostCard
              post={post}
              isLiked={likedSet?.has(post.id) || false}
              onLike={() =>
                toggleLike.mutate({
                  postId: post.id,
                  isLiked: likedSet?.has(post.id) || false,
                  challengeId: post.challenge_id,
                })
              }
              currentUserId={user?.id}
              challengeId={post.challenge_id}
            />
          </div>
        ))}

        {hasNextPage && (
          <Button
            variant="outline"
            className="w-full rounded-[14px] h-10 text-[13px]"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Ver mais posts
          </Button>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;
