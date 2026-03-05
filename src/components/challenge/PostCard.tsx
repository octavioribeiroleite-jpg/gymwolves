import { Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PostCardProps {
  post: any;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  currentUserId?: string;
}

const getInitials = (name: string) =>
  name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

const PostCard = ({ post, isLiked, onLike, onComment }: PostCardProps) => {
  const profile = post.profiles as any;
  const name = profile?.display_name || "Sem nome";

  return (
    <div className="rounded-[20px] surface-1 border border-subtle overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="text-[11px] font-bold text-primary">{getInitials(name)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold truncate">{name}</p>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="w-full aspect-square bg-secondary">
          <img src={post.image_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            className="flex items-center gap-1.5 text-[13px] transition-colors"
          >
            <Heart
              className={`h-5 w-5 transition-all ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"}`}
            />
            <span className={isLiked ? "text-red-500 font-medium" : "text-muted-foreground"}>
              {post.likes_count || 0}
            </span>
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments_count || 0}</span>
          </button>
        </div>

        {post.caption && (
          <p className="text-[14px]">
            <span className="font-bold mr-1.5">{name.split(" ")[0]}</span>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostCard;
