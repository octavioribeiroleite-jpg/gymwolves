import { useState } from "react";
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { usePostComments, useAddComment } from "@/hooks/useChallengePosts";
import { useSignedUrl } from "@/hooks/useSignedUrl";

interface PostCardProps {
  post: any;
  isLiked: boolean;
  onLike: () => void;
  currentUserId?: string;
  challengeId: string;
  onEdit?: (postId: string, caption: string) => void;
  onDelete?: (postId: string) => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

const PostCard = ({ post, isLiked, onLike, currentUserId, challengeId, onEdit, onDelete }: PostCardProps) => {
  const profile = post.profiles as any;
  const signedImageUrl = useSignedUrl(post.image_url);
  const name = profile?.display_name || "Sem nome";
  const isAuthor = currentUserId && post.user_id === currentUserId;
  const [editOpen, setEditOpen] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: comments } = usePostComments(post.id);
  const addComment = useAddComment();

  const handleEditOpen = () => {
    setEditCaption(post.caption || "");
    setEditOpen(true);
  };

  const handleEditSave = () => {
    onEdit?.(post.id, editCaption);
    setEditOpen(false);
  };

  const handleDelete = () => {
    if (confirm("Excluir este post?")) {
      onDelete?.(post.id);
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(
      { postId: post.id, text: commentText.trim(), challengeId },
      { onSuccess: () => setCommentText("") }
    );
  };

  const commentsCount = post.comments_count || 0;
  const previewComments = comments?.slice(-2) || [];
  const allComments = comments || [];

  return (
    <>
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
          {isAuthor && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEditOpen}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Image — full, uncropped like Instagram */}
        {signedImageUrl && (
          <div className="w-full bg-secondary">
            <img src={signedImageUrl} alt="" className="w-full object-contain max-h-[70vh]" />
          </div>
        )}

        {/* Actions + Comments */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-4">
            <button onClick={onLike} className="flex items-center gap-1.5 text-[13px] transition-colors">
              <Heart className={`h-5 w-5 transition-all ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"}`} />
              <span className={isLiked ? "text-red-500 font-medium" : "text-muted-foreground"}>{post.likes_count || 0}</span>
            </button>
            <button onClick={() => setShowAllComments(!showAllComments)} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              <span>{commentsCount}</span>
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="text-[14px]">
              <span className="font-bold mr-1.5">{name.split(" ")[0]}</span>
              {post.caption}
            </div>
          )}

          {/* "Ver todos os X comentários" */}
          {commentsCount > 2 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-[13px] text-muted-foreground"
            >
              Ver todos os {commentsCount} comentários
            </button>
          )}

          {/* Preview comments (last 2) or all comments */}
          {showAllComments ? (
            <div className="space-y-1.5">
              {allComments.map((c: any) => {
                const cProfile = c.profiles as any;
                const cName = cProfile?.display_name || "Sem nome";
                return (
                  <p key={c.id} className="text-[13px]">
                    <span className="font-bold mr-1.5">{cName.split(" ")[0]}</span>
                    <span className="text-foreground/90">{c.text}</span>
                  </p>
                );
              })}
            </div>
          ) : (
            previewComments.length > 0 && (
              <div className="space-y-1">
                {previewComments.map((c: any) => {
                  const cProfile = c.profiles as any;
                  const cName = cProfile?.display_name || "Sem nome";
                  return (
                    <p key={c.id} className="text-[13px]">
                      <span className="font-bold mr-1.5">{cName.split(" ")[0]}</span>
                      <span className="text-foreground/90">{c.text}</span>
                    </p>
                  );
                })}
              </div>
            )
          )}

          {/* Inline comment input */}
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 border-0 bg-transparent px-0 h-8 text-[13px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            />
            {commentText.trim() && (
              <button
                onClick={handleSendComment}
                disabled={addComment.isPending}
                className="text-[13px] font-semibold text-primary shrink-0 disabled:opacity-50"
              >
                {addComment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Publicar"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar post</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            placeholder="Escreva algo..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCard;
