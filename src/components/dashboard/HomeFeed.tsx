import { useMemo } from "react";
import { Loader2, ImageIcon, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHomeUnifiedFeed, type FeedItem } from "@/hooks/useHomeUnifiedFeed";
import { useUserLikes, useToggleLike } from "@/hooks/useChallengePosts";
import PostCard from "@/components/challenge/PostCard";
import CheckinFeedItem from "@/components/dashboard/CheckinFeedItem";
import { Button } from "@/components/ui/button";
import {
  useCheckinLikeCounts,
  useUserCheckinLikes,
  useToggleCheckinLike,
} from "@/hooks/useCheckinInteractions";

const HomeFeed = () => {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useHomeUnifiedFeed();

  const items: FeedItem[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) || [],
    [data]
  );

  const postItems = useMemo(
    () => items.filter((i): i is Extract<FeedItem, { type: "post" }> => i.type === "post"),
    [items]
  );
  const postIds = useMemo(() => postItems.map((i) => i.post.id), [postItems]);
  const firstChallengeId = postItems[0]?.post.challenge_id;
  const { data: likedSet } = useUserLikes(firstChallengeId, postIds);
  const toggleLike = useToggleLike();

  // Agrupa check-ins do mesmo usuário no mesmo instante (mesmo treino postado
  // em vários grupos) em um único card com badges de todos os grupos.
  const checkinItems = useMemo(
    () =>
      items.filter(
        (i): i is Extract<FeedItem, { type: "checkin" }> => i.type === "checkin"
      ),
    [items]
  );

  const checkinGroupKey = (ci: Extract<FeedItem, { type: "checkin" }>) => {
    const minute = new Date(ci.checkin.checkin_at).toISOString().slice(0, 16);
    return `${ci.checkin.user_id}|${minute}`;
  };

  const checkinGroups = useMemo(() => {
    const map = new Map<
      string,
      { primary: Extract<FeedItem, { type: "checkin" }>; groupNames: string[] }
    >();
    for (const ci of checkinItems) {
      const key = checkinGroupKey(ci);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          primary: ci,
          groupNames: ci.groupName ? [ci.groupName] : [],
        });
      } else if (ci.groupName && !existing.groupNames.includes(ci.groupName)) {
        existing.groupNames.push(ci.groupName);
      }
    }
    return map;
  }, [checkinItems]);

  const checkinIds = useMemo(
    () => Array.from(checkinGroups.values()).map((g) => g.primary.checkin.id),
    [checkinGroups]
  );
  const { data: checkinLikesCount } = useCheckinLikeCounts(checkinIds);
  const { data: checkinLikedSet } = useUserCheckinLikes(checkinIds);
  const toggleCheckinLike = useToggleCheckinLike();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-[13px] font-bold mb-2">Feed da matilha</h2>
        <div className="rounded-2xl surface-1 border border-subtle p-6 text-center">
          <ImageIcon className="mx-auto h-7 w-7 text-muted-foreground/30 mb-2" />
          <p className="text-[13px] text-muted-foreground">
            Nada por aqui ainda. Marque um check-in ou poste uma foto!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[13px] font-bold mb-2">Feed da matilha</h2>
      <div className="space-y-3">
        {items.map((item) => {
          if (item.type === "post") {
            const post = item.post;
            return (
              <div key={item.id} className="space-y-1.5">
                {item.groupName && (
                  <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
                    <Trophy className="h-3 w-3 text-primary" />
                    <span className="truncate">{item.groupName}</span>
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
            );
          }
          const isLiked = checkinLikedSet?.has(item.checkin.id) || false;
          return (
            <CheckinFeedItem
              key={item.id}
              checkin={item.checkin}
              groupName={item.groupName}
              isLiked={isLiked}
              likesCount={checkinLikesCount?.get(item.checkin.id) || 0}
              onLike={() =>
                toggleCheckinLike.mutate({ checkinId: item.checkin.id, isLiked })
              }
            />
          );
        })}

        {hasNextPage && (
          <Button
            variant="outline"
            className="w-full rounded-[14px] h-10 text-[13px]"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Ver mais
          </Button>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;
