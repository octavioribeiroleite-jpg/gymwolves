import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChallengePosts, useUserLikes, useToggleLike } from "@/hooks/useChallengePosts";
import { Loader2, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "./PostCard";
import CommentsSheet from "./CommentsSheet";
import CreatePostDialog from "./CreatePostDialog";

interface Props {
  challengeId: string;
}

const ChallengeFeedTab = ({ challengeId }: Props) => {
  const { user } = useAuth();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useChallengePosts(challengeId);
  const [createOpen, setCreateOpen] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const allPosts = useMemo(() => {
    return data?.pages.flatMap((p) => p.data) || [];
  }, [data]);

  const postIds = useMemo(() => allPosts.map((p: any) => p.id), [allPosts]);
  const { data: likedSet } = useUserLikes(challengeId, postIds);
  const toggleLike = useToggleLike();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.length === 0 ? (
        <div className="rounded-[20px] surface-1 border border-subtle p-8 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-[14px] text-muted-foreground mb-1">Nenhum post ainda</p>
          <p className="text-[12px] text-muted-foreground">Seja o primeiro a compartilhar!</p>
        </div>
      ) : (
        allPosts.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedSet?.has(post.id) || false}
            onLike={() => toggleLike.mutate({ postId: post.id, isLiked: likedSet?.has(post.id) || false, challengeId })}
            onComment={() => setCommentPostId(post.id)}
            currentUserId={user?.id}
          />
        ))
      )}

      {hasNextPage && (
        <Button
          variant="outline"
          className="w-full rounded-[14px] h-10 text-[13px]"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Carregar mais
        </Button>
      )}

      {/* FAB Create Post */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <CreatePostDialog
        challengeId={challengeId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <CommentsSheet
        postId={commentPostId}
        challengeId={challengeId}
        open={!!commentPostId}
        onOpenChange={(open) => { if (!open) setCommentPostId(null); }}
      />
    </div>
  );
};

export default ChallengeFeedTab;
